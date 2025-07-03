'use strict';

const { TASK_TABLE } = require('../models/taskModel')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn(TASK_TABLE, 'dateEnd', 'date_end')
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn(TASK_TABLE, 'date_end', 'dateEnd')
  }
};
