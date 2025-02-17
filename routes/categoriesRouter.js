const passport = require('passport')
const express = require('express')
const router = express.Router()
const CategoriesService = require('./../services/categoriesService')
const service = new CategoriesService()

router.post('/',
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
        try {
            const category = req.body
            const response = await service.createCategory(category)
            res.status(201).json(response)
        } catch (err) {
            next(err)
        }
    }
)

router.get('/',
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
        try {
            const categories = await service.getCategories()
            res.json(categories)
        } catch (err) {
            next(err)
        }
    }
)

module.exports = router
