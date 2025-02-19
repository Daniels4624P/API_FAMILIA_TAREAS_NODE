const { DataTypes, Model } = require('sequelize')

const INCOMES_TABLE = 'Incomes'

const incomesSchema = {
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
    valor: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    fecha: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
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

class Incomes extends Model {
    static associate(models) {
        this.belongsTo(models.User, { as: 'user', foreignKey: 'userId' })
        this.belongsTo(models.Accounts, { as: 'accountInicio', foreignKey: 'cuentaId' })
        this.belongsTo(models.Accounts, { as: 'accountDestino', foreignKey: 'destinoId' })
        this.belongsTo(models.Categories, { as: 'category', foreignKey: 'categoriaId' })
    }

    static config(sequelize) {
        return {
            sequelize,
            tableName: INCOMES_TABLE,
            modelName: 'Incomes',
            timestamps: false
        }
    }
}

module.exports = { INCOMES_TABLE, incomesSchema, Incomes }
