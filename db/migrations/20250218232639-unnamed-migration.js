'use strict';

const { INCOMES_TABLE } = require('./../models/incomesModel')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(INCOMES_TABLE, 'categoria_id', {
      type: Sequelize.DataTypes.INTEGER,
      field: 'categoria_id',
      references: {
        model: 'Categories',
        key: 'id'
      },
      allowNull: false,
      onDelete: 'SET NULL'
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn(INCOMES_TABLE, 'categoria_id')
  }
};
