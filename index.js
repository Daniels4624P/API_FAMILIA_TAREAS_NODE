const express = require('express')
const app = express()
const cors = require('cors')
const config = require('./config/config')
const { ormErrorHandler, boomErrorHandler, errorHandler } = require('./middlewares/errorHandler')
const routerApi = require('./routes/index')

app.use(express.json())
app.use(cors())

require('./utils/auth/index')

routerApi(app)

app.use(ormErrorHandler)
app.use(boomErrorHandler)
app.use(errorHandler)

app.listen(config.port, () => console.log(`La API esta corriendo en el puerto ${config.port}`))