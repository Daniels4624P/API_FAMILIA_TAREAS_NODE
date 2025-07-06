const boom = require('@hapi/boom')
const { models } = require('./../libs/sequelize')
const { Op } = require('sequelize')
const GOOGLE_CALENDAR_EVENTS = 'https://www.googleapis.com/calendar/v3/calendars/primary/events'

class FolderService {
    async createFolder(data, userId) {
        const newFolder = await models.Folder.create(data)
        if (!newFolder) {
            throw boom.notFound('No se pudo crear la carpeta')
        }
        return newFolder
    }

    async findPublicFolders() {
        const folders = models.Folder.findAll({
            where: {
                public: true
            }
        })
        return folders
    }

    async findPrivateFolders(userId) {
        const folders = models.Folder.findAll({
            where: {
                [Op.and]: [
                    { public: false },
                    { owner: userId }
                ]
            }
        })
        return folders
    }

    async findOneFolder(folderId) {
        const folder = models.Folder.findByPk(folderId)
        if (!folder) {
            throw boom.notFound('La carpeta no existe')
        }
        return folder
    }

    async updateFolder(folderId, changes, userId) {
        const folder = await models.Folder.findOne({
            where: {
                id: folderId,
                [Op.or]: [
                    { public: true },
                    { owner: userId }
                ]
            }
        })
        if (!folder) {
            throw boom.notFound('La carpeta no existe')
        }
        const updatedFolder = await folder.update(changes)
        return updatedFolder
    }
    
    async deleteOneFolder(folderId, userId) {
        const folder = await models.Folder.findOne({
            where: {
                id: folderId,
                [Op.or]: [
                    { public: true },
                    { owner: userId }
                ]
            }
        })
        if (!folder) {
            throw boom.notFound('La carpeta no existe')
        }
        await folder.destroy()
        return folderId
    }

    async getAllTasksInFolder(folderId, userId, accessTokenGoogle) {
        if (accessTokenGoogle) {
            const response = await fetch(GOOGLE_CALENDAR_EVENTS, {
                headers: {
                    Authorization: `Bearer ${accessTokenGoogle}`
                }
            })
            const dataGoogle = await response.json()

            const folder = await models.Folder.findOne({
                include: ['tasks'],
                where: {
                    id: folderId,
                    [Op.or]: [
                        { public: true },
                        { owner: userId }
                    ]
                }
            })
            if (!folder) {
                throw boom.notFound('La carpeta no existe')
            }
            return { folder, dataGoogle: dataGoogle.items }
        }
        const folder = await models.Folder.findOne({
            include: ['tasks'],
            where: {
                id: folderId,
                [Op.or]: [
                    { public: true },
                    { owner: userId }
                ]
            }
        })
        if (!folder) {
            throw boom.notFound('La carpeta no existe')
        }
        return folder
    }
}

module.exports = FolderService