const { Model, DataTypes } = require('sequelize')

const TASK_TABLE = 'Tasks'

const taskSchema = {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    task: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    points: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    folderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'folder_id',
        references: {
            model: 'Folders',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    dateStart: {
        field: 'date_start',
        type: DataTypes.DATE,
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    dateEnd: {
        field: 'date_end',
        type: DataTypes.DATE,
        allowNull: true
    },
    googleEventId: {
        field: 'google_event_id',
        type: DataTypes.TEXT,
        allowNull: true
    }
}

class Task extends Model {
    static associate(models) {
        this.belongsTo(models.Folder, { as: 'folder', foreignKey: 'folderId' })
        this.hasOne(models.HystoryTask, { as: 'hystory', foreignKey: 'taskId' })
        this.hasMany(models.UserTaskCompletion, { as: 'userTaskCompletion', foreignKey: 'taskId' })
    }
    
    static config(sequelize) {
        return {
            sequelize,
            tableName: TASK_TABLE,
            modelName: 'Task',
            timestamps: false
        }
    }
}

module.exports = { Task, TASK_TABLE, taskSchema }