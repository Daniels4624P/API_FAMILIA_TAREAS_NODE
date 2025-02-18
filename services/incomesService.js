const boom = require('@hapi/boom')
const { models } = require('../libs/sequelize')

class IncomesService {
    async createIncome(income) {
        const newIncome = await models.Incomes.create(income)
        const accountIncome = await models.Accounts.findByPk(newIncome.cuentaId)
        if (!accountIncome) {
            throw boom.notFound('No se pudo crear el ingreso')
        }
        const newSaldo = accountIncome.saldo + newIncome.valor
        await accountIncome.update({ saldo: newSaldo })
        return newIncome
    }

    async getIncomes(userId) {
        const incomes = await models.Incomes.findAll({
            where: {
                userId
            },
            include: ['account']
        })
        return incomes
    }

    async getIncome(userId, id) {
        const income = await models.Incomes.findOne({
            where: {
                userId,
                id
            },
            include: ['account']
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
        const accountIncome = await models.Accounts.findByPk(income.cuentaId)
        if (!accountIncome) {
            throw boom.notFound('No se encontro el ingreso')
        }
        const suma = (changes.valor ?? income.valor) - income.valor
        const newSaldo = accountIncome.saldo + suma
        await accountIncome.update({ saldo: newSaldo })
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
        const accountIncome = await models.Accounts.findByPk(income.cuentaId)
        if (!accountIncome) {
            throw boom.notFound('No se encontro el ingreso')
        }
        const newSaldo = accountIncome.saldo - income.valor
        await accountIncome.update({ saldo: newSaldo })
        await income.destroy()
        return { message: 'La cuenta se elimino correctamente' }
    }
}

module.exports = IncomesService
