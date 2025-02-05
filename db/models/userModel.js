const { Model, DataTypes } = require('sequelize')

const USER_TABLE = 'Users'

const userSchema = {
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
    email: {
        allowNull: true,
        type: DataTypes.STRING,
    },
    password: {
        allowNull: false,
        type: DataTypes.STRING,
    },
    points: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    role: {
        type: DataTypes.ENUM('user', 'admin'),
        defaultValue: 'user'
    }
}

class User extends Model {
    static associate(models) {
        this.hasMany(models.Proyect, { as: 'proyects', foreignKey: 'owner' })
        this.hasMany(models.Folder, { as: 'folders', foreignKey: 'owner' })
        this.hasMany(models.HystoryTask, { as: 'historyTasks', foreignKey: 'ownerId' });
        this.hasMany(models.UserTaskCompletion, { as: 'userTaskCompletion', foreignKey: 'userId' });
    }
    
    static config(sequelize) {
        return {
            sequelize,
            tableName: USER_TABLE,
            modelName: 'User',
            timestamps: false
        }
    }
}

module.exports = { User, USER_TABLE, userSchema }