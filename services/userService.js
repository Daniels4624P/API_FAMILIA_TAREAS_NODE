const boom = require('@hapi/boom')
const { models } = require('./../libs/sequelize')
const bcrypt = require('bcrypt')
const { Op } = require('sequelize')

class UserService {
    async getUserForId(userId) {
        const user = await models.User.findByPk(userId, {
            include: [
                {
                    association: 'folders',
                    include: ['tasks']
                },
                'proyects'
            ] 
        })
        if (!user) {
            throw boom.notFound('No se encontro el usuario')
        }
        return user
    } 

    async getUserForEmail(email) {
        const user = await models.User.findOne({ where: { email } }, {
            include: [
                {
                    association: 'folders',
                    include: ['tasks']
                },
                'proyects'
            ] 
        })
        if (!user) {
            throw boom.notFound('No se encontro el usuario')
        }
        return user
    }

    async getPointsFromUser(userId) {
        const user = await models.User.findByPk(userId)
        if (!user) {
            throw boom.notFound('No se encontro el usuario')
        }
        const points = await user.points
        return points
    }

    async createUser(data) {
        const hash = await bcrypt.hash(data.password, 10)
        const user = {
            ...data,
            password: hash
        }
        const newUser = await models.User.create(user)
        if (!newUser) {
            throw boom.notFound('No se pudo crear el usuario')
        }
        return newUser
    }

    async getUserHistory(userId) {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
    
        // Rango de fechas correctas
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 1); // Último día del mes actual
    
        // Buscar el historial de tareas dentro del mes actual
        const history = await models.HystoryTask.findAll({
            where: {
                ownerId: userId,
                hecha: {
                    [Op.between]: [startDate, endDate]
                }
            },
            order: [['hecha', 'ASC']]
        });
    
        // Obtener tareas asociadas en paralelo
        const historyFormatted = await Promise.all(history.map(async task => {
            const taskData = await models.Task.findByPk(task.taskId);
            return {
                ...task.toJSON(),
                taskId: taskData.task, // taskId es el objeto de la tarea
                hecha: task.hecha.toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })
            };
        }));
    
        return historyFormatted;
    }    

    async getScoreUsers() {
        const users = await models.User.findAll({
            order: [['points', 'DESC']]
        })
        const usersFormat = users.map(user => ({
            name: user.name,
            points: user.points
        }))
        return usersFormat
    } 
}

module.exports = UserService
