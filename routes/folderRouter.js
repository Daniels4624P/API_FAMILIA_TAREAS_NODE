const express = require('express')
const router = express.Router()
const { verifyToken, verifyRoles } = require('../middlewares/authHandler')
const FolderService = require('./../services/folderService')
const service = new FolderService()

router.post('/', verifyToken, async (req, res, next) => {
        try {
            const data = req.body
            const userId = req.user.sub
            const newFolder = {
                ...data,
                owner: userId
            }
            const response = await service.createFolder(newFolder)
            res.status(201).json(response)
        } catch (err) {
            next(err)
        }
    }
)

router.get('/public', verifyToken, async (req, res, next) => {
        try {
            const folders = await service.findPublicFolders()
            res.json(folders)
        } catch (err) {
            next(err)
        }
    }
)

router.get('/private', verifyToken, async (req, res, next) => {
        try {
            const userId = req.user.sub
            const folders = await service.findPrivateFolders(userId)
            res.json(folders)
        } catch (err) {
            next(err)
        }
    }
)

router.get('/:id', verifyToken, verifyRoles('admin'), async (req, res, next) => {
        try {
            const { id } = req.params
            const folder = await service.findOneFolder(id)
            res.json(folder)
        } catch (err) {
            next(err)
        }
    }
)

router.patch('/:id', verifyToken, async (req, res, next) => {
        try {
            const userId = req.user.sub
            const changes = req.body
            const { id } = req.params
            const folder = await service.updateFolder(id, changes, userId)
            res.json(folder)
        } catch (err) {
            next(err)
        }
    }
)

router.delete('/:id', verifyToken, async (req, res, next) => {
        try {
            const userId = req.user.sub
            const { id } = req.params
            const folder = await service.deleteOneFolder(id, userId)
            res.json(folder)
        } catch (err) {
            next(err)
        }
    }
)

router.get('/:folderId/tasks', verifyToken, async (req, res, next) => {
        try {
            const userId = req.user.sub
            const { folderId } = req.params
            const accessTokenGoogle = req.cookies.accessTokenGoogle
            const tasks = await service.getAllTasksInFolder(folderId, userId)
            res.json(tasks)
        } catch (err) {
            next(err)
        }
    }
)

module.exports = router