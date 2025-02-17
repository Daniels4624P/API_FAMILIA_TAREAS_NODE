const express = require('express')
const authRouter = require('./authRouter')
const userRouter = require('./userRouter')
const proyectRouter = require('./proyectsRouter')
const folderRouter = require('./folderRouter')
const taskRouter = require('./taskRouter')
const accountsRouter = require('./accountsRouter')

const routerApi = (app) => {
    const router = express.Router()
    app.use(router)
    router.use('/auth', authRouter)
    router.use('/users', userRouter)
    router.use('/projects', proyectRouter)
    router.use('/folders', folderRouter)
    router.use('/tasks', taskRouter)
    router.use('/accounts', accountsRouter)
}

module.exports = routerApi
