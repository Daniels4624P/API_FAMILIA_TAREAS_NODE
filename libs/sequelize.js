const { Sequelize } = require('sequelize')
const config = require('./../config/config')
const setupModels = require('./../db/models/index')

const URI = `postgresql://${config.dbUser}:${config.dbPassword}@${config.dbHost}/${config.dbName}`

const sequelize = new Sequelize(URI, {
    dialect: 'postgres',
    logging: true,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
})

setupModels(sequelize)

module.exports = sequelize