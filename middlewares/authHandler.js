const boom = require('@hapi/boom')

const verifyRoles = (...roles) => (req, res, next) => {
    const user = req.user
    if (roles.includes(user.role)) {
        next()
    } else {
        next(boom.unauthorized('El usuario no puede usar esta funcion'))
    }
}

module.exports = verifyRoles