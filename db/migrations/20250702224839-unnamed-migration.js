'use strict';

const { TASK_TABLE } = require('../models/taskModel')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(TASK_TABLE, 'dateEnd', { field: 'date_end', type: Sequelize.DataTypes.DATE, allowNull: true })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn(TASK_TABLE, 'date_start', 'date')
    await queryInterface.removeColumn(TASK_TABLE, 'dateEnd')
  }
};
