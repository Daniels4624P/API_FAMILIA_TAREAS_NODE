'use strict';

const { ACCOUNTS_TABLE } = require('./../models/accountsModel')
const { EXPENSES_TABLE } = require('./../models/expensesModel')
const { INCOMES_TABLE } = require('./../models/incomesModel')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(ACCOUNTS_TABLE, 'public', {
      allowNull: false,
      type: Sequelize.DataTypes.BOOLEAN,
      defaultValue: false
    })
    await queryInterface.addColumn(EXPENSES_TABLE, 'destino_id', {
      allowNull: true,
      type: Sequelize.DataTypes.INTEGER,
      field: 'destino_id',
      references: {
        model: 'Accounts',
        key: 'id'
      },
      onDelete: 'SET NULL'
    })
    await queryInterface.addColumn(INCOMES_TABLE, 'destino_id', {
      allowNull: true,
      type: Sequelize.DataTypes.INTEGER,
      field: 'destino_id',
      references: {
        model: 'Accounts',
        key: 'id'
      },
      onDelete: 'SET NULL'
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn(ACCOUNTS_TABLE, 'public')
    await queryInterface.removeColumn(EXPENSES_TABLE, 'destino_id')
    await queryInterface.removeColumn(INCOMES_TABLE, 'destino_id')
  }
};
