const { Model, DataTypes } = require('sequelize')

const PROYECT_TABLE = 'Proyects'

const proyectSchema = {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    name: {
        allowNull: false,
        type: DataTypes.STRING,
    },
    description: {
        allowNull: true,
        type: DataTypes.STRING,
    },
    completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    public: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    owner: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    }
}

class Proyect extends Model {
    static associate(models) {
        this.belongsTo(models.User, { as: 'user', foreignKey: 'owner' })
    }
    
    static config(sequelize) {
        return {
            sequelize,
            tableName: PROYECT_TABLE,
            modelName: 'Proyect',
            timestamps: false
        }
    }
}

module.exports = { Proyect, PROYECT_TABLE, proyectSchema }