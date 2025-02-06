const { Model, DataTypes } = require('sequelize')

const USER_TASK_COMPLETION_TABLE = 'User_Task_Completion'

const userTaskCompletionSchema = {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    userId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
            model: 'Users',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    taskId: {
        allowNull: true,
        type: DataTypes.INTEGER,
        references: {
            model: 'Tasks',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    hecha: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}

class UserTaskCompletion extends Model {
    static associate(models) {
        this.belongsTo(models.User, { as: 'user', foreignKey: 'userId' })
        this.belongsTo(models.Task, { as: 'task', foreignKey: 'taskId' })
    }
    
    static config(sequelize) {
        return {
            sequelize,
            tableName: USER_TASK_COMPLETION_TABLE,
            modelName: 'UserTaskCompletion',
            timestamps: false
        }
    }
}

module.exports = { UserTaskCompletion, USER_TASK_COMPLETION_TABLE, userTaskCompletionSchema }
