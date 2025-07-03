const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middlewares/authHandler')
const UserService = require('./../services/userService')
const AuthService = require('./../services/authService')
const serviceUser = new UserService()
const serviceAuth = new AuthService()
const config = require('../config/config')

router.post('/register', async (req, res, next) => {
    try {
        const newUser = req.body
        const { user, accessToken, refreshToken } = await serviceAuth.register(newUser)
        delete user.dataValues.password
        
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            maxAge: 3600000,
            sameSite: 'strict',
            secure: config.nodeEnv === 'production' ? true : false 
        }).cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 604800000,
            sameSite: 'strict',
            secure: config.nodeEnv === 'production' ? true : false 
        })
        res.status(201).json(user)
    } catch (err) {
        next(err)
    }
})

router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body
        const { accessToken, refreshToken, user } = await serviceAuth.login(email, password)
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            maxAge: 3600000,
            sameSite: 'strict',
            secure: config.nodeEnv === 'production' ? true : false 
        }).cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 604800000,
            sameSite: 'strict',
            secure: config.nodeEnv === 'production' ? true : false 
        })
        res.status(201).json(user)
    } catch (err) {
        next(err)
    }
})

router.get('/profile', verifyToken, async (req, res, next) => {
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

router.delete('/logout', verifyToken, async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken
        const response = await serviceAuth.logout(refreshToken)
        res.clearCookie('accessToken').clearCookie('refreshToken').json(response)
    } catch (err) {
        next(err)
    }
})

router.post('/refresh', async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken
        const { newAccessToken, newRefreshToken } = await serviceAuth.refresh(refreshToken)
        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            maxAge: 3600000,
            sameSite: 'strict',
            secure: config.nodeEnv === 'production' ? true : false 
        }).cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            maxAge: 604800000,
            sameSite: 'strict',
            secure: config.nodeEnv === 'production' ? true : false 
        })

        res.json({ message: 'Tokens Refrescados' })
    } catch (err) {
        next(err)
    }
})

module.exports = router