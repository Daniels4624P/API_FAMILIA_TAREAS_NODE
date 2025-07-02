const { verifyToken } = require('../middlewares/authHandler')
const express = require('express')
const router = express.Router()
const ExpensesService = require('./../services/expensesService')
const service = new ExpensesService()

router.post('/', verifyToken, async (req, res, next ) => {
        try {
            const user = req.user
            const expense = req.body
            const newExpense = {
                ...expense,
                userId: user.sub
            }
            const response = await service.createExpense(newExpense)
            res.status(201).json(response)
        } catch (err) {
            next(err)
        }
    }
)

router.get('/', verifyToken, async (req, res, next ) => {
        try {
            const user = req.user
            const expenses = await service.getExpenses(user.sub)
            res.json(expenses)
        } catch (err) {
            next(err)
        }
    }
)

router.get('/:id', verifyToken, async (req, res, next ) => {
        try {
            const { id } = req.params
            const user = req.user
            const expense = await service.getExpense(user.sub, id)
            res.json(expense)
        } catch (err) {
            next(err)
        }
    }
)

router.patch('/:id', verifyToken, async (req, res, next ) => {
        try {
            const { id } = req.params
            const user = req.user
            const changes = req.body
            const expense = await service.updateExpense(id, changes)
            res.json(expense)
        } catch (err) {
            next(err)
        }
    }
)

router.delete('/:id', verifyToken, async (req, res, next ) => {
        try {
            const { id } = req.params
            const user = req.user
            const expense = await service.deleteExpense(id)
            res.json(expense)
        } catch (err) {
            next(err)
        }
    }
)

module.exports = router