const express = require('express')
const router = express.Router()
const passport = require('passport')
const jwt = require('jsonwebtoken')
const config = require('./../config/config')
const UserService = require('./../services/userService')
const AuthService = require('./../services/authService')
const serviceUser = new UserService()
const serviceAuth = new AuthService()

router.post('/register', async (req, res, next) => {
    try {
        const newUser = req.body
        const response = await serviceUser.createUser(newUser)
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
        const token = await serviceAuth.login(user)
        res.status(201).json(token)
    } catch (err) {
        next(err)
    }
})

router.get('/profile', 
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
        try {
            const user = req.user
            const perfil = await serviceUser.getUserForId(user.sub)
            delete perfil.dataValues.password
            res.json(perfil)
        } catch (err) {
            next(err)
        }
    })

router.post('/recovery', async (req, res, next) => {
    try {
        const { email } = req.body
        const response = await serviceAuth.sendMail(email)
        res.json(response)
    } catch (err) {
        next(err)
    }
})

router.post('/change-password', async (req, res, next) => {
    try {
        const { token, newPassword } = req.body
        const response = await serviceAuth.changePassword(token, newPassword)
        res.json(response)
    } catch (err) {
        next(err)
    }
})

module.exports = router
