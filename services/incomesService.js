const boom = require('@hapi/boom')
const { models } = require('../libs/sequelize')

class IncomesService {
    async createIncome(income) {
        const newIncome = await models.Incomes.create(income)
        if (!newIncome) {
            throw boom.notFound('No se pudo crear el ingreso')
        }
        return newIncome
    }

    async getIncomes(userId) {
        const incomes = await models.Incomes.findAll({
            where: {
                userId
            }
        })
        return incomes
    }

    async getIncome(userId, id) {
        const income = await models.Incomes.findOne({
            where: {
                userId,
                id
            }
        })
        if (!income) {
            throw boom.notFound('No se encontro el ingreso')
        }
        return income
    }

    async updateIncome(userId, id, changes) {
        const income = await models.Incomes.findOne({
            where: {
                userId,
                id
            }
        })
        if (!income) {
            throw boom.notFound('No se encontro el ingreso')
        }
        await income.update(changes)
        return income
    }

    async deleteIncome(userId, id) {
        const income = await models.Incomes.findOne({
            where: {
                userId,
                id
            }
        })
        if (!income) {
            throw boom.notFound('No se encontro el ingreso')
        }
        await income.destroy()
        return { message: 'La cuenta se elimino correctamente' }
    }
}

module.exports = IncomesService
