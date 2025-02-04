const express = require('express')
const router = express.Router()
const passport = require('passport')
const jwt = require('jsonwebtoken')
const config = require('./../config/config')
const UserService = require('./../services/userService')
const service = new UserService()

router.post('/register', async (req, res, next) => {
    try {
        const newUser = req.body
        const response = await service.createUser(newUser)
        delete response.dataValues.password
        res.status(201).json(response)
    } catch (err) {
        next(err)
    }
})

router.post('/login', 
    passport.authenticate('local', { session: false }),
    async (req, res, next) => {
    try {
        const user = req.user
        delete user.dataValues.password
        const payload = {
            sub: user.id,
            role: user.role
        }
        const token = jwt.sign(payload, config.jwtSecret)
        res.json({
            user,
            token
        })
    } catch (err) {
        next(err)
    }
})

router.get('/profile', 
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
        try {
            const user = req.user
            const perfil = await service.getUserForId(user.sub)
            delete perfil.dataValues.password
            res.json(perfil)
        } catch (err) {
            next(err)
        }
    })

module.exports = router