const { Model, DataTypes, Sequelize } = require('sequelize')

const HYSTORY_TASKS_TABLE = 'History_Tasks'

const hystoryTaskSchema = {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    taskId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
            model: 'Tasks',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    ownerId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
            model: 'Users',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    hecha: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW
    }
}

class HystoryTask extends Model {
    static associate(models) {
        this.belongsTo(models.Task, { as: 'task', foreignKey: 'taskId' })
        this.belongsTo(models.User, { as: 'user', foreignKey: 'ownerId' })
    }
    
    static config(sequelize) {
        return {
            sequelize,
            tableName: HYSTORY_TASKS_TABLE,
            modelName: 'HystoryTask',
            timestamps: false
        }
    }
}

module.exports = { HystoryTask, HYSTORY_TASKS_TABLE, hystoryTaskSchema }