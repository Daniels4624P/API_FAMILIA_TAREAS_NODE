const boom = require('@hapi/boom')
const { models } = require('./../libs/sequelize')

class CategoriesService {
    async createCategory(category) {
        const newCategory = await models.Categories.create(category)
        if (!newCategory) {
            throw boom.notFound('No se pudo crear el gasto')
        }
        return newCategory
    }

    async getCategories() {
        const categories = await models.Categories.findAll()
        return categories
    }
}

module.exports = CategoriesService
