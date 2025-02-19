const boom = require('@hapi/boom')
const { models } = require('../libs/sequelize')

class AccountsService {
    async createAccount(account) {
        const newAccount = await models.Accounts.create(account)
        if (!newAccount) {
            throw boom.notFound('No se pudo crear la cuenta')
        }
        return newAccount
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

    async getAccountStatistics(userId) {
        const accounts = await models.Accounts.findAll({
            where: { userId },
            attributes: ['id', 'name']
        })

        let stats = []

        for (const account of account) {
            const totalExpenses = await models.Expenses.sum('valor', { where: { cuentaId: account.id } }) || 0
            const totalIncomes = await models.Incomes.sum('valor', { where: { cuentaId: account.id } }) || 0

            stats.push({
                cuentaId: account.id,
                cuentaNombre: account.name,
                totalExpenses,
                totalIncomes
            })
        }

        return stats
    }
}

module.exports = AccountsService
