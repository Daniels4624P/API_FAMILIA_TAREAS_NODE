const boom = require('@hapi/boom')
const { models } = require('./../libs/sequelize')
const { Op } = require('sequelize')
const { Sequelize } = require('sequelize')
const GOOGLE_CALENDAR_CREATE_EVENT = 'https://www.googleapis.com/calendar/v3/calendars/primary/events'
const GOOGLE_CALENDAR_UPDATE_EVENT = (eventId) => `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`

class TaskService {
    async createTask(data, userId, accessTokenGoogle) {
        const { dateStart, dateEnd, description, task, points } = data
        const folder = await models.Folder.findOne({
            where: {
                id: data.folderId,
                [Op.or]: [
                    { public: true },
                    { owner: userId}
                ]
            }
        })
        
        if (!folder) {
            throw boom.forbidden('La carpeta no existe')
        }
        
        if (data.local) {
            const newTask = await models.Task.create({
                dateStart,
                description,
                task,
                points,
                folderId: folder.id
            })
            return newTask
        }

        if (!accessTokenGoogle) {
            throw boom.forbidden()
        }
        
        // Si no es local la tarea toca enviar dateEnd obligatoriamente y enviar el timeZone, reminderMinutesPopup y el reminderMinutesEmail
        if (!data.dateEnd || !data.timeZone) {
            throw boom.badRequest()
        }

        const newTask = await models.Task.create({
            dateStart,
            dateEnd,
            task,
            description,
            points,
            folderId: folder.id
        })

        const event = {
            summary: data.task,
            reminders: {
                useDefault: false,
                overrides: []
            },
            start: {
                dateTime: data.dateStart,
                timeZone: data.timeZone
            },
            end: {
                dateTime: data.dateEnd,
                timeZone: data.timeZone
            },
            colorId: String(Math.floor(Math.random() * 11) + 1),
            status: 'confirmed'
        }
        if (data.description) {
            event.description = data.description
        }

        if (data.reminderMinutesPopup) {
            event.reminders.overrides.push({ method: 'popup', minutes: data.reminderMinutesPopup })
        }

        if (data.reminderMinutesEmail) {
            event.reminders.overrides.push({ method: 'email', minutes: data.reminderMinutesEmail })
        }

        if (event.reminders.overrides.length === 0) {
            event.reminders.useDefault = true
            delete event.reminders.overrides
        }

        const response = await fetch(GOOGLE_CALENDAR_CREATE_EVENT, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json", 
                Authorization: `Bearer ${accessTokenGoogle}`
            },
            body: JSON.stringify(event)
        })

        if (!response.ok) {
            const errorData = await response.json()
            console.error('Error al crear evento de Google:', errorData)
            throw boom.badImplementation('Error al crear el evento en Google Calendar')
        }

        const result = await response.json()

        await newTask.update({ googleEventId: result.id })

        return { newTask, result }
    }

    async updateTask(id, changes, userId, accessTokenGoogle) {
        const task = await models.Task.findOne({
            where: { id },
            include: {
                model: models.Folder,
                as: 'folder',
                attributes: ['id', 'public', 'owner']
            }
        });

        if (!task) {
            throw boom.notFound('Tarea no encontrada');
        }

        // Verificar que la carpeta sea pública o del usuario
        if (!task.folder.public && task.folder.owner !== userId) {
            throw boom.unauthorized('No tienes permiso para editar esta tarea');
        }

        if (task.googleEventId) {
            const changesModel = {}
            const googleEventUpdateUrl = GOOGLE_CALENDAR_UPDATE_EVENT(task.googleEventId)
            const event = {}

            if (changes.task) {
                event.summary = changes.task
                changesModel.task = changes.task
            }

            if (changes.description) {
                event.description = changes.description
                changesModel.description = changes.description
            }

            if (changes.dateStart) {
                event.start = {}
                event.start.dateTime = changes.dateStart
                event.start.timeZone = changes.timeZone
                changesModel.dateStart = changes.dateStart
            }

            if (changes.dateEnd) {
                event.end = {}
                event.end.dateTime = changes.dateEnd
                event.end.timeZone = changes.timeZone
                changesModel.dateEnd = changes.dateEnd
            }

            if (changes.reminderMinutesPopup) {
                if (!event.reminders) {
                    event.reminders = {}
                }

                event.reminders.useDefault = false
                
                if (!event.reminders.overrides) {
                    event.reminders.overrides = []
                }
                
                event.reminders.overrides.push({ method: 'popup', minutes: changes.reminderMinutesPopup })
            }

            if (changes.reminderMinutesEmail) {
                if (!event.reminders) {
                    event.reminders = {}
                }

                event.reminders.useDefault = false
                
                if (!event.reminders.overrides) {
                    event.reminders.overrides = []
                }

                event.reminders.overrides.push({ method: 'email', minutes: changes.reminderMinutesEmail })
            }

            const response = await fetch(googleEventUpdateUrl, {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessTokenGoogle}`
                },
                body: JSON.stringify(event)
            })

            if (!response.ok) {
                const error = await response.json()
                console.error('Error al editar una tarea', error)
                throw boom.unauthorized()
            }

            const result = await response.json()

            await task.update(changesModel)
            return { message: 'Tarea actualizada', task, result }
        }

        // Actualizar la tarea
        await task.update(changes);
        return { message: 'Tarea actualizada', task }
    }
    async deleteTask(id, userId, accessTokenGoogle) {
        const task = await models.Task.findOne({
            where: { id },
            include: {
                model: models.Folder,
                as: 'folder',
                attributes: ['id', 'public', 'owner']
            }
        });

        if (!task) {
            throw boom.notFound('Tarea no encontrada');
        }

        // Verificar permisos: solo el dueño de la carpeta o tareas públicas
        if (!task.folder.public && task.folder.owner !== userId) {
            throw boom.unauthorized('No tienes permiso para eliminar esta tarea');
        }

        if (task.googleEventId) {
            const googleRemoveEventUrl = GOOGLE_CALENDAR_UPDATE_EVENT(task.googleEventId)
            const response = await fetch(googleRemoveEventUrl, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${accessTokenGoogle}`
                }
            })

            if (response.status !== 204) {
                const error = await response.json()
                console.error(error)
                throw boom.unauthorized()
            }

            await task.destroy()
            return { id }
        }

        // Eliminar la tarea
        await task.destroy();
        return { id }
    }

    async completeTaskPrivate(id, userId) {
            const task = await models.Task.findOne({
                where: { id },
                include: {
                    model: models.Folder,
                    as: 'folder',
                    attributes: ['id', 'public', 'owner']
                }
            })
            if (!task) {
                throw boom.notFound('Tarea no encontrada');
            }
            if (!task.folder.public && task.folder.owner !== userId) {
                throw boom.unauthorized('No tienes permiso para completar esta tarea');
            }
            const now = Date.now()
            await task.update({ completed: true, dateEnd: now });
            const user = await models.User.findByPk(userId)
            await user.update({ points: user.points + task.points })
            await models.HystoryTask.create({
                taskId: task.dataValues.id,
                ownerId: userId
            })
            return task
    }

    async completeTaskPublic(id, userId, numberRepeat) {
        if (!numberRepeat) {
            numberRepeat = 1
        }
        const task = await models.Task.findOne({
            where: { id },
            include: {
                model: models.Folder,
                as: 'folder',
                attributes: ['id', 'public', 'owner']
            }
        })
        if (!task) {
            throw boom.notFound('Tarea no encontrada');
        }
        if (!task.folder.public && task.folder.owner !== userId) {
            throw boom.unauthorized('No tienes permiso para completar esta tarea');
        }

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const existingCompletion = await models.UserTaskCompletion.findOne({
            where: {
                taskId: id,
                userId,
                hecha: {
                    [Op.gte]: startOfToday
                }
            }
        });
    
        if (existingCompletion) {
            throw boom.conflict('Ya has completado esta tarea');
        }
    
        // Registrar la finalización de la tarea en la tabla intermedia
        for (let i = 0; i < numberRepeat; i++) {
            await models.UserTaskCompletion.create({
                taskId: id,
                userId
            });
            const user = await models.User.findByPk(userId)
            await user.update({ points: user.points + task.points })
            await models.HystoryTask.create({
                taskId: task.dataValues.id,
                ownerId: userId
            })
        }
        return task
    }

    async descompletedTasks() {
        const tasks = await models.Task.update(
            { completed: false }, 
            { where: { completed: true } } // Solo descompletar las que están completadas
        );
        return { message: 'Tareas Descompletadas' }
    }

    async tasksForMonth(userId, query) {
        let { year, month } = query

        if (!year || !month) {
            const lastTask = await models.HystoryTask.findOne({
                attributes: [[Sequelize.fn('MAX', Sequelize.col('hecha')), 'lastDate']],
                where: { ownerId: userId }
            })
            
            if (lastTask && lastTask.dataValues.lastDate) {
                const lastDate = new Date(lastTask.dataValues.lastDate)
                year = lastDate.getFullYear()
                month = lastDate.getMonth() + 1
            } else {
                throw boom.notFound('No hay tareas registradas')
            }
        }

        month = String(month).padStart(2, '0')

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);

        if (isNaN(startDate) || isNaN(endDate)) {
            throw boom.badRequest('Fecha inválida generada');
        }

        const taskPerMonth = await models.HystoryTask.findAll({
            attributes: [
                [Sequelize.fn('DATE_TRUNC', 'week', Sequelize.col('hecha')), 'week'],
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'taskCount']
            ],
            where: { 
                ownerId: userId,
                hecha: {
                [Sequelize.Op.between]: [startDate, endDate]
                }
            },
            group: ['week'],
            order: [['week', 'ASC']]
        })

        return taskPerMonth
    }
}

module.exports = TaskService