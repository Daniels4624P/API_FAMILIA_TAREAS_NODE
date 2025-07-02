const express = require('express')
const router = express.Router()
const { verifyToken, verifyRoles} = require('../middlewares/authHandler')
const ProyectService = require('./../services/proyectsService')
const service = new ProyectService()

router.post('/', verifyToken, async (req, res, next) => {
        try {
            const owner = req.user.sub
            const data = req.body
            const newProyect = {
                ...data,
                owner
            }
            const response = await service.createProyect(newProyect)
            res.status(201).json(response)
        } catch (err) {
            next(err)
        }
    }
)

router.get('/public', verifyToken, async (req, res, next) => {
        try {
            const publicProyects = await service.getAllProyectsPublics()
            res.json(publicProyects)
        } catch (err) {
            next(err)
        }
    }
)

router.get('/private', verifyToken, async (req, res, next) => {
        try {
            const user = req.user
            const privateProjects = await service.getAllProyectsPrivate(user.sub)
            res.json(privateProjects)
        } catch (err) {
            next(err)
        }
    }
)

router.get('/:id', verifyToken, verifyRoles('admin'), async (req, res, next) => {
        try {
            const { id } = req.params
            const project = await service.getOneProyect(id)
            res.json(project)
        } catch (err) {
            next(err)
        }
    }
)

router.patch('/:id', verifyToken, async (req, res, next) => {
        try {
            const userId = req.user.sub
            const { id } = req.params
            const changes = req.body
            const project = await service.updateProyect(id, changes, userId)
            res.json(project)
        } catch (err) {
            next(err)
        }
    }
)

router.delete('/:id', verifyToken, async (req, res, next) => {
        try {
            const userId = req.user.sub
            const { id } = req.params
            const project = await service.deleteProject(id, userId)
            res.json(project)
        } catch (err) {
            next(err)
        }
    }
)

router.post('/:id/complete', verifyToken, async (req, res, next) => {
        try {
            const userId = req.user.sub
            const { id } = req.params
            const project = await service.completedProject(id, userId)
            res.json(project)
        } catch (err) {
            next(err)
        }
    }
)

module.exports = router