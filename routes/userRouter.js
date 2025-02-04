const express = require('express')
const router = express.Router()
const passport = require('passport')
const checkRoles = require('./../middlewares/authHandler')
const UserService = require('./../services/userService')
const service = new UserService()

router.get('/points', 
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
        try {
            const users = await service.getScoreUsers()
            res.json(users)
        } catch (err) {
            next(err)
        }
    }
)

router.get('/:id/points', 
    passport.authenticate('jwt', { session: false }),
    checkRoles('admin'),
    async (req, res, next) => {
        try {
            const { id } = req.params
            const user = await service.getUserForId(id)
            res.json(user.points)
        } catch (err) {
            next(err)
        }
    }
)

router.get('/history',
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
        try {
            const userId = req.user.sub
            const historial = await service.getUserHistory(userId)
            res.json(historial)
        } catch (err) {
            next(err)
        }
    }
)

module.exports = router