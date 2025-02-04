const { Strategy } = require('passport-local')
const UserService = require('./../../../services/userService')
const service = new UserService()
const boom = require('@hapi/boom')
const bcrypt = require('bcrypt')

const localStrategy = new Strategy({
    usernameField: 'email'
}, 
async (email, password, done) => {
    try {
        const user = await service.getUserForEmail(email)
        if (!user) {
            done(boom.unauthorized(), false)
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            done(boom.unauthorized(), false)
        }
        done(null, user)
    } catch (err) {
        done(err, false)
    }
})

module.exports = localStrategy