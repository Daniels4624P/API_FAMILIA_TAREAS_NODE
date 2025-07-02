const { DataTypes, Model } = require('sequelize')

const EXPENSES_TABLE = 'Expenses'

const expensesSchema = {
    id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER
    },
    userId: {
        type: DataTypes.INTEGER,
        field: 'user_id',
        references: {
            model: 'Users',
            key: 'id'
        },
        onDelete: 'CASCADE',
        allowNull: false
    },
    cuentaId: {
        type: DataTypes.INTEGER,
        field: 'cuenta_id',
        references: {
            model: 'Accounts',
            key: 'id'
        },
        onDelete: 'CASCADE',
        allowNull: false,
    },
    categoriaId: {
        type: DataTypes.INTEGER,
        field: 'categoria_id',
        references: {
            model: 'Categories',
            key: 'id'
        },
        allowNull: false,
        onDelete: 'SET NULL'
    },
    valor: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    },
    destinoId: {
        allowNull: true,
        type: DataTypes.INTEGER,
        field: 'destino_id',
        references: {
            model: 'Accounts',
            key: 'id'
        },
        onDelete: 'SET NULL'
    }
}

class Expenses extends Model {
    static associate(models) {
        this.belongsTo(models.User, { as: 'user', foreignKey: 'userId' })
        this.belongsTo(models.Accounts, { as: 'accountInicio', foreignKey: 'cuentaId' })
        this.belongsTo(models.Accounts, { as: 'accountDestino', foreignKey: 'destinoId' })
        this.belongsTo(models.Categories, { as: 'category', foreignKey: 'categoriaId' })
    }

    static config(sequelize) {
        return {
            sequelize,
            tableName: EXPENSES_TABLE,
            modelName: 'Expenses',
            timestamps: false
        }
    }
}

module.exports = { EXPENSES_TABLE, expensesSchema, Expenses }