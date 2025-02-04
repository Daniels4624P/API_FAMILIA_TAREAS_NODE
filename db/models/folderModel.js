const { Model, DataTypes } = require('sequelize')

const FOLDER_TABLE = 'Folders'

const folderSchema = {
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
    public: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    owner: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    }
}

class Folder extends Model {
    static associate(models) {
        this.belongsTo(models.User, { as: 'user', foreignKey: 'owner' })
        this.hasMany(models.Task, { as: 'tasks', foreignKey: 'folderId' })
    }
    
    static config(sequelize) {
        return {
            sequelize,
            tableName: FOLDER_TABLE,
            modelName: 'Folder',
            timestamps: false
        }
    }
}

module.exports = { Folder, FOLDER_TABLE, folderSchema }