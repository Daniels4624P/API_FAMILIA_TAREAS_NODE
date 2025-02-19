const { DataTypes, Model } = require('sequelize')

const ACCOUNTS_TABLE = 'Accounts'

const accountsSchema = {
    id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER
    },
    name: {
        allowNull: false,
        type: DataTypes.STRING,
    },
    tipo: {
        allowNull: false,
        type: DataTypes.ENUM('Ahorros', 'Corriente', 'Credito'),
    },
    saldo: {
        allowNull: false,
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    userId: {
        field: 'user_id',
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    creado: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    public: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}

class Accounts extends Model {
    static associate(models) {
        this.belongsTo(models.User, { as: 'user', foreignKey: 'userId' })
        this.hasMany(models.Expenses, { as: 'expense', foreignKey: 'cuentaId' })
    }

    static config(sequelize) {
        return {
            sequelize,
            tableName: ACCOUNTS_TABLE,
            timestamps: false,
            modelName: 'Accounts'
        }
    }
}

module.exports = { ACCOUNTS_TABLE, accountsSchema, Accounts }
