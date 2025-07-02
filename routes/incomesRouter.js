const { verifyToken } = require('../middlewares/authHandler')
const express = require('express')
const router = express.Router()
const IncomesService = require('./../services/incomesService')
const service = new IncomesService()

router.post('/', verifyToken, async (req, res, next) => {
        try {
            const user = req.user
            const income = req.body
            const newIncome = {
                ...income,
                userId: user.sub
            }
            const response = await service.createIncome(newIncome)
            res.status(201).json(response)
        } catch (err) {
            next(err)
        }
    }
)

router.get('/', verifyToken, async (req, res, next) => {
        try {
            const user = req.user
            const incomes = await service.getIncomes(user.sub)
            res.json(incomes)
        } catch (err) {
            next(err)
        }
    }
)

router.get('/:id', verifyToken, async (req, res, next) => {
        try {
            const { id } = req.params
            const user = req.user
            const income = await service.getIncome(user.sub, id)
            res.json(income)
        } catch (err) {
            next(err)
        }
    }
)

router.patch('/:id', verifyToken, async (req, res, next) => {
        try {
            const { id } = req.params
            const user = req.user
            const changes = req.body
            const income = await service.updateIncome(user.sub, id, changes)
            res.json(income)
        } catch (err) {
            next(err)
        }
    }
)

router.delete('/:id', verifyToken, async (req, res, next) => {
        try {
            const { id } = req.params
            const user = req.user
            const income = await service.deleteIncome(user.sub, id)
            res.json(income)
        } catch (err) {
            next(err)
        }
    }
)

module.exports = router