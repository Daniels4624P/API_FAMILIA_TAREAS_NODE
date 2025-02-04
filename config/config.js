require('dotenv').config()

const config = {
    port: process.env.PORT,
    nodeEnv: process.env.NODE_ENV,
    dbUser: process.env.USER_DB,
    dbPort: process.env.DB_PORT,
    dbPassword: process.env.DB_PASSWORD,
    dbName: process.env.DB_NAME,
    dbHost: process.env.DB_HOST,
    jwtSecret: process.env.JWT_SECRET
}

module.exports = config