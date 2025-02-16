const userService = require('./userService')
const service = new userService()
const bcrypt = require('bcrypt')
const boom = require('@hapi/boom')
const config = require('./../config/config')
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')

class AuthService {
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

    async login(user) {
        const payload = {
            sub: user.id,
            role: user.role
        }
        const token = jwt.sign(payload, config.jwtSecret)
        return { user, token }
    }

    async sendMail(email) {
        const user = await service.getUserForEmail(email)
        if (!user) {
            throw boom.unauthorized()
        }
        const payload = {
            sub: user.id
        }
        const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '10min' })
        const link = `https://proyecto-familia-tareas-frontend.onrender.com/recovery?token=${token}`
        await service.update(user.id, { recoveryToken: token })
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
            const payload = jwt.verify(token, config.jwtSecret)
            const user = await service.getUserForId(payload.sub)
            if (user.recoveryToken !== token) {
                throw boom.unauthorized()
            }
            const hash = await bcrypt.hash(newPassword, 10)
            await service.update(user.id, { password: hash, recoveryToken: null })
            return { message: 'changed password' }
        } catch (err) {
            throw boom.unauthorized()
        }
    }
}

module.exports = AuthService
