const boom = require('@hapi/boom')
const { models } = require('../libs/sequelize')

class AccountsService {
    async createAccount(account) {
        const newAccount = await models.Accounts.create(Account)
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
        if (!accounts) {
            throw boom.notFound('No se pudo crear la cuenta')
        }
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
