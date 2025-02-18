const boom = require('@hapi/boom')
const { models } = require('./../libs/sequelize')

class ExpensesService {
    async createExpense(expense) {
        const newExpense = await models.Expenses.create(expense)
        if (!newExpense) {
            throw boom.notFound('No se pudo crear el gasto')
        }
        const account = await models.Accounts.findOne({ where: { id: expense.cuentaId }})
        await account.dataValues.saldo - expense.valor
        return newExpense
    }

    async getExpenses(userId) {
        const expenses = await models.Expenses.findAll({
            where: {
                userId
            }
        })
        return expenses
    }

    async getExpense(userId, id) {
        const expense = await models.Expenses.findOne({
            where: {
                userId,
                id
            }
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
        if (!expense) {
            throw boom.notFound('No se encontro el gasto')
        }
        await expense.destroy()
        return { message: 'El gasto se elimino correctamente' }
    }
}

module.exports = ExpensesService
