'use strict';

const { ACCOUNTS_TABLE } = require('../models/accountsModel');
const { EXPENSES_TABLE } = require('../models/expensesModel');
const { INCOMES_TABLE } = require('../models/incomesModel');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn(EXPENSES_TABLE, 'valor', { type: Sequelize.DataTypes.BIGINT, allowNull: false, defaultValue: 0 })
    await queryInterface.changeColumn(ACCOUNTS_TABLE, 'saldo', { type: Sequelize.DataTypes.BIGINT, allowNull: false, defaultValue: 0 })
    await queryInterface.changeColumn(INCOMES_TABLE, 'valor', { type: Sequelize.DataTypes.BIGINT, allowNull: false, defaultValue: 0 })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn(EXPENSES_TABLE, 'valor', { type: Sequelize.DataTypes.INTEGER, allowNull: false, defaultValue: 0 })
    await queryInterface.changeColumn(ACCOUNTS_TABLE, 'saldo', { type: Sequelize.DataTypes.INTEGER, allowNull: false, defaultValue: 0 })
    await queryInterface.changeColumn(INCOMES_TABLE, 'valor', { type: Sequelize.DataTypes.INTEGER, allowNull: false, defaultValue: 0 })
  }
};
