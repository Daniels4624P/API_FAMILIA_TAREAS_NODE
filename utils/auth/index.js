const passport = require('passport')
const jwtStrategy = require('./strategies/jwtStrategy')
const localStrategy = require('./strategies/localStrategy')

passport.use(localStrategy)
passport.use(jwtStrategy)