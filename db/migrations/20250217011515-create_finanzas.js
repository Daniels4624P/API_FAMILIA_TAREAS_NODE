'use strict';

const { ACCOUNTS_TABLE, accountsSchema } = require('./../models/accountsModel')
const { CATEGORIES_TABLE, categoriesSchema } = require('./../models/categoriesModel')
const { EXPENSES_TABLE, expensesSchema } = require('./../models/expensesModel')
const { INCOMES_TABLE, incomesSchema } = require('./../models/incomesModel')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(ACCOUNTS_TABLE, accountsSchema)
    await queryInterface.createTable(CATEGORIES_TABLE, categoriesSchema)
    await queryInterface.createTable(EXPENSES_TABLE, expensesSchema)
    await queryInterface.createTable(INCOMES_TABLE, incomesSchema)
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable(ACCOUNTS_TABLE)
    await queryInterface.dropTable(CATEGORIES_TABLE)
    await queryInterface.dropTable(EXPENSES_TABLE)
    await queryInterface.dropTable(INCOMES_TABLE)
  }
};
