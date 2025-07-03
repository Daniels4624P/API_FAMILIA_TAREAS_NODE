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
    },
    recoveryToken: {
        field: 'recovery_token',
        type: DataTypes.STRING,
        allowNull: true
    },
    recoveryTokenExpire: {
        field: 'recovery_token_expire',
        type: DataTypes.DATE,
        allowNull: true
    },
    refreshToken: {
        field: 'refresh_token',
        type: DataTypes.STRING,
        allowNull: true
    }
}

class User extends Model {
    static associate(models) {
        this.hasMany(models.Proyect, { as: 'proyects', foreignKey: 'owner' })
        this.hasMany(models.Folder, { as: 'folders', foreignKey: 'owner' })
        this.hasMany(models.HystoryTask, { as: 'historyTasks', foreignKey: 'ownerId' });
        this.hasMany(models.UserTaskCompletion, { as: 'userTaskCompletion', foreignKey: 'userId' });
        this.hasMany(models.Accounts, { as: 'accounts', foreignKey: 'userId' });
        this.hasMany(models.Expenses, { as: 'expenses', foreignKey: 'userId' });
        this.hasMany(models.Incomes, { as: 'incomes', foreignKey: 'userId' });
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