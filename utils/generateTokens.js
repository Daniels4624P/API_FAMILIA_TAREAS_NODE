const jwt = require('jsonwebtoken')
const config = require('../config/config')

const generateToken = (payload, type) => {
    switch (type) {
        case 'Access':
            return jwt.sign(payload, config.jwtSecretAccess, { expiresIn: '1h' })
        case 'Refresh':
            return jwt.sign(payload, config.jwtSecretRefresh, { expiresIn: '7d' })
        default:
            return undefined
    }
}

module.exports = generateToken