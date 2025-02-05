'use strict';

const { USER_TASK_COMPLETION_TABLE, userTaskCompletionSchema } = require('./../models/UserTaskCompletionModel')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(USER_TASK_COMPLETION_TABLE, userTaskCompletionSchema)
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable(USER_TASK_COMPLETION_TABLE)
  }
};
