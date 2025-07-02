const { DataTypes, Model } = require('sequelize')

const CATEGORIES_TABLE = 'Categories'

const categoriesSchema = {
    id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    }
}

class Categories extends Model {
    static associate(models) {
        this.hasMany(models.Expenses, { as: 'expenses', foreignKey: 'categoriaId' })
    }

    static config(sequelize) {
        return {
            sequelize,
            tableName: CATEGORIES_TABLE,
            modelName: 'Categories',
            timestamps: false
        }
    }
}

module.exports = { CATEGORIES_TABLE, categoriesSchema, Categories }