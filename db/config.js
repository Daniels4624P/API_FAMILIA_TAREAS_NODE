const config = require('./../config/config')

const USER = encodeURIComponent(config.dbUser)
const PASSWORD = encodeURIComponent(config.dbPassword)
const URI = `postgresql://${USER}:${PASSWORD}@${config.dbHost}/${config.dbName}?sslmode=require&channel_binding=require`

module.exports = {
    development: {
        url: URI,
        dialect: 'postgres',
        dialectOptions: {
          ssl: {
            require: true,  // Requerir SSL
            rejectUnauthorized: true // Evitar errores por certificados autofirmados
          }
        }
    },
    production: {
        url: URI,
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
              require: true,  // Requerir SSL
              rejectUnauthorized: true // Evitar errores por certificados autofirmados
            }
          },
        timezone: "-05:00"
    }
}