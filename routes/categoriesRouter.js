const express = require('express')
const { verifyToken } = require('../middlewares/authHandler')
const router = express.Router()
const CategoriesService = require('./../services/categoriesService')
const service = new CategoriesService()

router.post('/', verifyToken, async (req, res, next) => {
        try {
            const category = req.body
            const response = await service.createCategory(category)
            res.status(201).json(response)
        } catch (err) {
            next(err)
        }
    }
)

router.get('/', verifyToken, async (req, res, next) => {
        try {
            const categories = await service.getCategories()
            res.json(categories)
        } catch (err) {
            next(err)
        }
    }
)

module.exports = router