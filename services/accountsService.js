const boom = require('@hapi/boom')
const { models } = require('../libs/sequelize')

class AccountsService {
    async createExpense(expense) {
        const newExpense = await models.Expenses.create(expense)
        if (!newExpense) {
            throw boom.notFound('No se pudo crear el gasto')
        }
        const account = await models.Accounts.findOne({ where: { id: expense.cuentaId }})
        await account.dataValues.saldo - expense.valor
        return newExpense
    }

    async getAccounts(userId) {
        const accounts = await models.Accounts.findAll({
            where: {
                userId
            }
        })
        return accounts
    }

    async getAccount(userId, id) {
        const account = await models.Accounts.findOne({
            where: {
                userId,
                id
            }
        })
        if (!account) {
            throw boom.notFound('No se encontro la cuenta')
        }
        return account
    }

    async updateAccount(userId, id, changes) {
        const account = await models.Accounts.findOne({
            where: {
                userId,
                id
            }
        })
        if (!account) {
            throw boom.notFound('No se encontro la cuenta')
        }
        await account.update(changes)
        return account
    }

    async deleteAccount(userId, id) {
        const account = await models.Accounts.findOne({
            where: {
                userId,
                id
            }
        })
        if (!account) {
            throw boom.notFound('No se encontro la cuenta')
        }
        await account.destroy()
        return { message: 'La cuenta se elimino correctamente' }
    }
}

module.exports = AccountsService
