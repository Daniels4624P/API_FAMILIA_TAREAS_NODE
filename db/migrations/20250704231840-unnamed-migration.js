'use strict';

const { TASK_TABLE } = require('../models/taskModel');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(TASK_TABLE, 'googleEventId', { type: Sequelize.DataTypes.TEXT, allowNull: true })
    await queryInterface.renameColumn(TASK_TABLE, 'googleEventId', 'google_event_id')
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn(TASK_TABLE, 'googleEventId')
    await queryInterface.renameColumn(TASK_TABLE, 'google_event_id', 'googleEventId')
  }
};
