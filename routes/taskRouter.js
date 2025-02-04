const express = require('express')
const router = express.Router()
const passport = require('passport')
const checkRoles = require('./../middlewares/authHandler')
const TaskService = require('./../services/taskService')
const service = new TaskService()

router.post('/',
    passport.authenticate('jwt',  { session: false }),
    async (req, res, next) => {
        try {
            const userId = req.user.sub
            const task = req.body
            const response = await service.createTask(task, userId)
            res.status(201).json(response)
        } catch (err) {
            next(err)
        }
    }
)

router.patch('/:id',
    passport.authenticate('jwt',  { session: false }),
    async (req, res, next) => {
        try {
            const userId = req.user.sub
            const { id } = req.params
            const changes = req.body
            const response = await service.updateTask(id, changes, userId)
            res.json(response)
        } catch (err) {
            next(err)
        }
    }
)

router.delete('/:id',
    passport.authenticate('jwt',  { session: false }),
    async (req, res, next) => {
        try {
            const userId = req.user.sub
            const { id } = req.params
            const response = await service.deleteTask(id, userId)
            res.json(response)
        } catch (err) {
            next(err)
        }
    }
)

router.patch('/:id/complete',
    passport.authenticate('jwt',  { session: false }),
    async (req, res, next) => {
        try {
            const userId = req.user.sub
            const { id } = req.params
            const response = await service.completeTask(id, userId)
            res.json(response)
        } catch (err) {
            next(err)
        }
    }
)

router.patch('/descompleted/tasks',
    passport.authenticate('jwt',  { session: false }),
    async (req, res, next) => {
        try {
            const response = await service.descompletedTasks()
            res.json(response)
        } catch (err) {
            next(err)
        }
    }
)

module.exports = router