'use strict';

const { TASK_TABLE } = require('./../models/taskModel')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(TASK_TABLE, 'date', { type: Sequelize.DataTypes.DATE, allowNull: true })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn(TASK_TABLE, 'date')
  }
};
