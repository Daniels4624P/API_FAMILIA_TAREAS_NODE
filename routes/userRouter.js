const express = require('express')
const router = express.Router()
const { verifyToken, verifyRoles } = require('../middlewares/authHandler')
const UserService = require('./../services/userService')
const service = new UserService()

router.get('/points', verifyToken, async (req, res, next) => {
        try {
            const users = await service.getScoreUsers()
            res.json(users)
        } catch (err) {
            next(err)
        }
    }
)

router.get('/:id/points', verifyToken, verifyRoles('admin'), async (req, res, next) => {
        try {
            const { id } = req.params
            const user = await service.getUserForId(id)
            res.json(user.points)
        } catch (err) {
            next(err)
        }
    }
)

router.get('/history', verifyToken, async (req, res, next) => {
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