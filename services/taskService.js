const boom = require('@hapi/boom')
const { models } = require('./../libs/sequelize')
const { Op } = require('sequelize')
const { Sequelize } = require('sequelize')

class TaskService {
    async createTask(data, userId) {
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
            throw boom.unauthorized('La carpeta no existe')
        }
        const newTask = await models.Task.create({
            ...data,
            folderId: folder.id
        })
        return newTask
    }

    async updateTask(id, changes, userId) {
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

        // Actualizar la tarea
        await task.update(changes);
        return { message: 'Tarea actualizada', task }
    }
    async deleteTask(id, userId) {
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
            await task.update({ completed: true });
            const user = await models.User.findByPk(userId)
            await user.update({ points: user.points + task.points })
            await models.HystoryTask.create({
                taskId: task.dataValues.id,
                ownerId: userId
            })
            return task
    }

    async completeTaskPublic(id, userId) {
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