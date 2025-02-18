const boom = require('@hapi/boom')
const { models } = require('./../libs/sequelize')

class ExpensesService {
    async createExpense(expense) {
        const newExpense = await models.Expenses.create(expense)
        const accountExpense = await models.Accounts.findByPk(newExpense.cuentaId)
        if (!accountExpense) {
            throw boom.notFound('No se pudo crear el gasto')
        }
        const newSaldo = accountExpense.saldo - newExpense.valor
        await accountExpense.update({ saldo: newSaldo })
        return newExpense
    }

    async getExpenses(userId) {
        const expenses = await models.Expenses.findAll({
            where: {
                userId
            },
            include: ['account', 'category']
        })
        return expenses
    }

    async getExpense(userId, id) {
        const expense = await models.Expenses.findOne({
            where: {
                userId,
                id
            },
            include: ['account', 'category']
        })
        if (!expense) {
            throw boom.notFound('No se encontro el gasto')
        }
        return expense
    }

    async updateExpense(userId, id, changes) {
        const expense = await models.Expenses.findOne({
            where: {
                userId,
                id
            }
        })
        if (!expense) {
            throw boom.notFound('No se encontro el gasto')
        }
        await expense.update(changes)
        return expense
    }

    async deleteExpense(userId, id) {
        const expense = await models.Expenses.findOne({
            where: {
                userId,
                id
            }
        })
        const accountExpense = await models.Accounts.findByPk(expense.cuentaId)
        if (!accountExpense) {
            throw boom.notFound('No se encontro el gasto')
        }
        const newSaldo = accountExpense.saldo + expense.valor
        await accountExpense.update({ saldo: newSaldo })
        await expense.destroy()
        return { message: 'El gasto se elimino correctamente' }
    }
}

module.exports = ExpensesService
