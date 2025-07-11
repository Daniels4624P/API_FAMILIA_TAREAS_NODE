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
            sameSite: config.nodeEnv === 'production' ? 'none' : 'strict',
            secure: config.nodeEnv === 'production' ? true : false 
        })
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 604800000,
            sameSite: config.nodeEnv === 'production' ? 'none' : 'strict',
            secure: config.nodeEnv === 'production' ? true : false 
        })
        return res.status(201).json(user)
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
            sameSite: config.nodeEnv === 'production' ? 'none' : 'strict',
            secure: config.nodeEnv === 'production' ? true : false 
        })
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 604800000,
            sameSite: config.nodeEnv === 'production' ? 'none' : 'strict',
            secure: config.nodeEnv === 'production' ? true : false 
        })
        return res.status(201).json(user)
    } catch (err) {
        next(err)
    }
})

router.get('/profile', verifyToken, async (req, res, next) => {
        try {
            const user = req.user
            const perfil = await serviceUser.getUserForId(user.sub)
            delete perfil.dataValues.password
            return res.json(perfil)
        } catch (err) {
            next(err)
        }
    })

router.patch('/profile', verifyToken, async (req, res, next) => {
    try {
        const user = req.user
        const changes = req.body
        const userUpdated = await serviceUser.update(user.sub, changes)
        delete userUpdated.dataValues.password
        return res.json(userUpdated)
    } catch (err) {
        next(err)
    }
})

router.post('/recovery', async (req, res, next) => {
    try {
        const { email } = req.body
        const response = await serviceAuth.sendMail(email)
        return res.json(response)
    } catch (err) {
        next(err)
    }
})

router.post('/change-password', async (req, res, next) => {
    try {
        const { token, newPassword } = req.body
        const response = await serviceAuth.changePassword(token, newPassword)
        return res.json(response)
    } catch (err) {
        next(err)
    }
})

router.delete('/logout', verifyToken, async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken
        const response = await serviceAuth.logout(refreshToken)
        res.clearCookie('accessToken', {
            httpOnly: true,
            sameSite: config.nodeEnv === 'production' ? 'none' : 'strict',
            secure: config.nodeEnv === 'production' ? true : false 
        })
        res.clearCookie('refreshToken', {
            httpOnly: true,
            sameSite: config.nodeEnv === 'production' ? 'none' : 'strict',
            secure: config.nodeEnv === 'production' ? true : false 
        })
        res.clearCookie('accessTokenGoogle', {
            httpOnly: true,
            sameSite: config.nodeEnv === 'production' ? 'none' : 'strict',
            secure: config.nodeEnv === 'production' ? true : false 
        })
        return res.json(response)
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
            sameSite: config.nodeEnv === 'production' ? 'none' : 'strict',
            secure: config.nodeEnv === 'production' ? true : false 
        })
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            maxAge: 604800000,
            sameSite: config.nodeEnv === 'production' ? 'none' : 'strict',
            secure: config.nodeEnv === 'production' ? true : false 
        })

        return res.json({ message: 'Tokens Refrescados' })
    } catch (err) {
        next(err)
    }
})

router.get('/google/handler', (req, res, next) => {
    try {
        const { mobile, redirect_uri } = req.query
        const { url } = serviceAuth.googleHandler(mobile, redirect_uri)
        return res.json(url)
    } catch (err) {
        next(err)
    }
})

router.get('/google/callback', async (req, res, next) => {
    try {
        const state = req.query.state
        const code = req.query.code
        const { accessToken, refreshToken, accessTokenGoogle } = await serviceAuth.googleCallback(state, code)

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            maxAge: 3600000,
            sameSite: config.nodeEnv === 'production' ? 'none' : 'strict',
            secure: config.nodeEnv === 'production' ? true : false 
        })
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 3600000,
            sameSite: config.nodeEnv === 'production' ? 'none' : 'strict',
            secure: config.nodeEnv === 'production' ? true : false 
        })
        res.cookie('accessTokenGoogle', accessTokenGoogle, {
            httpOnly: true,
            maxAge: 3600000,
            sameSite: config.nodeEnv === 'production' ? 'none' : 'strict',
            secure: config.nodeEnv === 'production' ? true : false 
        })

        const urlRedirect = config.nodeEnv === 'production' ? 'https://familia-tareas.netlify.app' : 'http://localhost:5173'
        return res.json({ message: "Set cookies" })
    } catch (err) {
        next(err)
    }
})

router.get('/x/handler', (req, res, next) => {
    try {
        const { mobile, redirect_uri } = req.query
        const { url } = serviceAuth.xHandler(mobile, redirect_uri)
        
        return res.json(url)
    } catch (err) {
        next(err)
    }
})

router.get('/x/callback', async (req, res, next) => {
    try {
        const { code, state } = req.query

        const { accessToken, refreshToken, user } = await serviceAuth.xCallback(state, code)

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            maxAge: 3600000,
            sameSite: config.nodeEnv === 'production' ? 'none' : 'strict',
            secure: config.nodeEnv === 'production' ? true : false 
        })
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 3600000,
            sameSite: config.nodeEnv === 'production' ? 'none' : 'strict',
            secure: config.nodeEnv === 'production' ? true : false 
        })

        const urlRedirect = config.nodeEnv === 'production' ? 'https://familia-tareas.netlify.app' : 'http://localhost:5173'
        return res.json({ message: "Set cookies" })
    } catch (err) {
        next(err)
    }
})

router.get('/google-calendar-status', (req, res, next) => {
    try {
        if (req.cookies.accessTokenGoogle) {
            return res.json({ hasAccess: true })
        } else {
            return res.json({ hasAccess: false })
        }
    } catch (err) {
        next(err)
    }
})

module.exports = router
