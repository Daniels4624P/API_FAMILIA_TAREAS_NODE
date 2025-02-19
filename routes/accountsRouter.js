const passport = require('passport')
const express = require('express')
const router = express.Router()
const accountsService = require('./../services/accountsService')
const service = new accountsService()

router.post('/',
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
        try {
            const user = req.user
            const account = req.body
            const Account = {
                ...account,
                userId: user.sub
            }
            const response = await service.createAccount(Account)
            res.status(201).json(response)
        } catch (err) {
            next(err)
        }
    }
)

router.get('/',
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
        try {
            const user = req.user
            const accounts = await service.getAccounts(user.sub)
            res.json(accounts)
        } catch (err) {
            next(err)
        }
    }
)

router.get('/:id',
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
        try {
            const { id } = req.params
            const user = req.user
            const account = await service.getAccount(user.sub, id)
            res.json(account)
        } catch (err) {
            next(err)
        }
    }
)

router.patch('/:id',
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
        try {
            const changes = req.body
            const { id } = req.params
            const user = req.user
            const account = await service.updateAccount(user.sub, id, changes)
            res.json(account)
        } catch (err) {
            next(err)
        }
    }
)

router.delete('/:id',
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
        try {
            const { id } = req.params
            const user = req.user
            const account = await service.deleteAccount(user.sub, id)
            res.json(account)
        } catch (err) {
            next(err)
        }
    }
)

router.get('/statistics',
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
        try {
            const user = req.user
            const stats = await service.getAccountStatistics(user.sub)
            res.json(stats)
        } catch (err) {
            next(err)
        }
    }
)

module.exports = router
