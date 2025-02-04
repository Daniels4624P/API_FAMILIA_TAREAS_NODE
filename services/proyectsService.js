const boom = require('@hapi/boom')
const { models } = require('./../libs/sequelize')
const { Op } = require('sequelize')

class ProyectService {
    async createProyect(data) {
        const proyect = await models.Proyect.create(data)
        if (!proyect) {
            boom.notFound('No se pudo crear el proyecto')
        }
        return proyect
    }

    async getAllProyectsPublics() {
        const proyects = await models.Proyect.findAll({
            where: {public: true}
        })
        return proyects
    }

    async getAllProyectsPrivate(userId) {
        const proyects = await models.Proyect.findAll({
            where: {
                [Op.and]: [
                    {public: false}, 
                    {owner: userId}
                ]
            }
        })
        return proyects
    }

    async getOneProyect(proyectId) {
        const proyect = await models.Proyect.findByPk(proyectId)
        if (!proyect) {
            throw boom.notFound('El proyecto no existe')
        }
        return proyect
    }

    async updateProyect(proyectId, changes, userId) {
        const proyect = await models.Proyect.findOne({
            where: {
                id: proyectId,
                [Op.or]: [
                    { public: true },
                    { owner: userId }
                ]
            }
        })
        if (!proyect) {
            throw boom.notFound('El proyecto no existe')
        }
        const newProyect = await proyect.update(changes)
        return newProyect
    }
    
    async deleteProject(proyectId, userId) {
        console.log(userId)
        const proyect = await models.Proyect.findOne({
            where: {
                id: proyectId,
                [Op.or]: [
                    { public: true },
                    { owner: userId }
                ]
            }
        })
        if (!proyect) {
            throw boom.notFound('El proyecto no existe')
        }
        await proyect.destroy()
        return proyectId
    }

    async completedProject(proyectId, userId) {
        const proyect = await models.Proyect.findOne({
            where: {
                id: proyectId,
                [Op.or]: [
                    { public: true },
                    { owner: userId }
                ]
            }
        })
        if (!proyect) {
            throw boom.notFound('El proyecto no existe')
        }
        await proyect.update({ completed: !proyect.completed })
        return proyect
    }
}

module.exports = ProyectService