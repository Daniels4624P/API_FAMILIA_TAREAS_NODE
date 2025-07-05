const userService = require('./userService')
const service = new userService()
const bcrypt = require('bcrypt')
const boom = require('@hapi/boom')
const config = require('./../config/config')
const nodemailer = require('nodemailer')
const generateToken = require('../utils/generateTokens')
const generateCode = require('../utils/generateCode')
const jwt = require('jsonwebtoken')
const randomString = require('randomstring')
const queryString = require('querystring')
const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(config.googleClientId)
const session = {}
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const X_AUTH_URL = "https://twitter.com/i/oauth2/authorize"
const X_TOKEN_URL = "https://api.twitter.com/2/oauth2/token"
const X_ME_ENDPOINT = 'https://api.twitter.com/2/users/me'
const { generateCodeChallenge } = require('../utils/encode')

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

    googleHandler() {
        const scopes = [
            'openid',
            'email',
            'profile',
            'https://www.googleapis.com/auth/calendar'
        ]

        const state = randomString.generate(16)
        session['state'] = state

        const query = queryString.stringify({
            response_type: 'code',
            redirect_uri: config.googleRedirectUri,
            client_id: config.googleClientId,
            scope: scopes.join(' '),
            state
        })

        return { url: `${GOOGLE_AUTH_URL}?${query}` }
    }

    async googleCallback(state, code) {
        if (state !== session['state']) {
            throw boom.unauthorized()
        }

        const options = {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: queryString.stringify({
                client_id: config.googleClientId,
                client_secret: config.googleClientSecret,
                grant_type: 'authorization_code',
                redirect_uri: config.googleRedirectUri,
                code
            })
        }

        const response = await fetch(GOOGLE_TOKEN_URL, options)
        const { id_token, access_token } = await response.json()

        const { accessToken, refreshToken } = await this.loginWithGoogle(id_token)

        return { accessToken, refreshToken, accessTokenGoogle: access_token }
    }

    async loginWithGoogle(idToken) {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: config.googleClientId
        })

        const payload = ticket.getPayload()
        const googleId = payload.sub
        const email = payload.email
        const name = payload.name

        let user = await service.getUserForGoogleId(googleId, email)
        if (!user) {
            user = await service.createUser({
                googleId,
                name,
                email,
                password: null,
                authProvider: 'Google'
            })
        }

        const accessToken = generateToken({ sub: user.id }, 'Access')
        const refreshToken = generateToken({ sub: user.id }, 'Refresh')

        const userUpdated = await service.update(user.id, { refreshToken })

        return { accessToken, refreshToken }
    }

    xHandler() {
        const scopes = [
            'tweet.read', 
            'users.read', 
            'offline.access',
            'users.email'
        ]

        const state = randomString.generate(16)
        session["state"] = state

        const codeVerifier = randomString.generate(128)
        session['codeVerifier'] = codeVerifier
        const codeChallenge = generateCodeChallenge(codeVerifier)

        const query = queryString.stringify({
            response_type: 'code',
            redirect_uri: config.xRedirectUri,
            client_id: config.xClientId,
            scope: scopes.join(' '),
            state,
            code_challenge: codeChallenge,
            code_challenge_method: 'S256'
        })

        return { url: `${X_AUTH_URL}?${query}` }
    }

    async xCallback(stateX, code) {
        if (stateX !== session["state"]) {
            throw boom.unauthorized()
        }

        const options = {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: queryString.stringify({
                client_id: config.xClientId,
                grant_type: 'authorization_code',
                redirect_uri: config.xRedirectUri,
                code,
                code_verifier: session['codeVerifier']
            })
        }
        
        const response = await fetch(X_TOKEN_URL, options)
        const { access_token } = await response.json()

        const user = await this.loginWithX(access_token)
        return user
    }

    async loginWithX(access_Token) {
        const responseMe = await fetch(X_ME_ENDPOINT, {
            headers: {
                Authorization: `Bearer ${access_Token}`
            }
        })
        const resultMe = await responseMe.json()
        
        let user = await service.getUserForTwitterId(resultMe.data.id)
        if (!user) {
            user = await service.createUser({
                name: resultMe.data.name,
                authProvider: 'twitter',
                twitterId: resultMe.data.id
            })
        }

        const accessToken = generateToken({ sub: user.id }, 'Access')
        const refreshToken = generateToken({ sub: user.id }, 'Refresh')

        const userUpdated = await service.update(user.id, { refreshToken })

        return { accessToken, refreshToken, user }
    }
}

module.exports = AuthService
