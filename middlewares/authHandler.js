const boom = require('@hapi/boom')
const jwt = require('jsonwebtoken')
const config = require('../config/config')

const verifyRoles = (...roles) => (req, res, next) => {
    const user = req.user
    if (roles.includes(user.role)) {
        next()
    } else {
        return next(boom.unauthorized('El usuario no puede usar esta funcion'))
    }
}

const verifyToken = (req, res, next) => {
    console.log(req.cookies)
    const accessToken = req.cookies.accessToken
    
    if (!accessToken) {
        return next(boom.unauthorized('El usuario no esta autenticado'))
    }

    try {
        const payload = jwt.verify(accessToken, config.jwtSecretAccess)
        req.user = payload
        next()
    } catch (err) {
        return next(boom.notFound(err.message))
    }
}

module.exports = {
    verifyRoles,
    verifyToken
}