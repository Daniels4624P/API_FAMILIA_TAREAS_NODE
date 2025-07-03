const userService = require('./userService')
const service = new userService()
const bcrypt = require('bcrypt')
const boom = require('@hapi/boom')
const config = require('./../config/config')
const nodemailer = require('nodemailer')
const generateToken = require('../utils/generateTokens')
const generateCode = require('../utils/generateCode')
const jwt = require('jsonwebtoken')

class AuthService {
    async register(newUser) {
        const user = await service.createUser(newUser)
        const payload = {
            sub: user.id
        }
        const accessToken = generateToken(payload, 'Access')
        const refreshToken = generateToken(payload, 'Refresh')

        return { user, accessToken, refreshToken }
    }

    async getUser(email, password) {
        const user = await service.getUserForEmail(email)
        if (!user) {
            throw boom.unauthorized()
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            throw boom.unauthorized()
        }
        return user
    }

    async login(email, password) {
        const user = await this.getUser(email, password)
        const payload = {
            sub: user.id,
            role: user.role
        }
        const accessToken = generateToken(payload, 'Access')
        const refreshToken = generateToken(payload, 'Refresh')

        const userUpdated = await service.update(user.id, { refreshToken })
        return { user, accessToken, refreshToken }
    }

    async sendMail(email) {
        const user = await service.getUserForEmail(email)
        if (!user) {
            throw boom.unauthorized()
        }
        const token = generateCode()
        const now = Date.now()
        const TEN_MINUTES = 10 * 60 * 1000
        const link = config.nodeEnv === 'production' ? `https://proyecto-familia-tareas-frontend.onrender.com/recovery?token=${token}` : `http://localhost:5173/recovery?token=${token}`
        const userUpdated = await service.update(user.id, { recoveryToken: token, recoveryTokenExpire: new Date(now + TEN_MINUTES ) })
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: config.emailApi,
                pass: config.passEmail
            }
        })

        await transporter.sendMail({
            from: config.emailApi,
            to: `${user.email}`,
            subject: 'Cambio de contrasena',
            html: `<h1>Hola ${user.name}</h1><p>aqui esta tu link de recuperacion de contrasena => ${link}</p>`
        })

        return { message: 'mail sent' }
    }

    async changePassword(token, newPassword) {
        try {
            const user = await service.getUserForRecoveryToken(token)
            const hash = await bcrypt.hash(newPassword, 10)
            const userUpdated = await service.update(user.id, { password: hash, recoveryToken: null, recoveryTokenExpire: null })
            return { message: 'changed password' }
        } catch (err) {
            throw boom.unauthorized()
        }
    }

    async logout(refreshToken) {
        try {
            const user = await service.getUserForRefreshToken(refreshToken)
            const userUpdated = await service.update(user.id, { recoveryToken: null, recoveryTokenExpire: null, refreshToken: null })
            return { message:'Logout exitoso' }
        } catch (error) {
            throw boom.forbidden()
        }
    }

    async refresh(refreshToken) {
        try {
            const user = await service.getUserForRefreshToken(refreshToken)
            const payload = jwt.verify(refreshToken, config.jwtSecretRefresh)
            const newAccessToken = generateToken({ sub: user.id }, 'Access')
            const newRefreshToken = generateToken({ sub: user.id }, 'Refresh')
            const userUpdated = await service.update(user.id, { refreshToken: newRefreshToken })
            return { newAccessToken, newRefreshToken }
        } catch (err) {
            throw boom.forbidden()
        }
    }
}

module.exports = AuthService
