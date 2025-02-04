'use strict';

const { USER_TABLE, userSchema } = require('./../models/userModel')
const { FOLDER_TABLE, folderSchema } = require('./../models/folderModel')
const { PROYECT_TABLE, proyectSchema } = require('./../models/proyectModel')
const { TASK_TABLE, taskSchema } = require('./../models/taskModel')
const { HYSTORY_TASKS_TABLE, hystoryTaskSchema } = require('./../models/hystoryTasksModel')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    await queryInterface.createTable(USER_TABLE, userSchema)
    await queryInterface.createTable(FOLDER_TABLE, folderSchema)
    await queryInterface.createTable(TASK_TABLE, taskSchema)
    await queryInterface.createTable(PROYECT_TABLE, proyectSchema)
    await queryInterface.createTable(HYSTORY_TASKS_TABLE, hystoryTaskSchema)
  },

  async down (queryInterface) {
    await queryInterface.dropTable(HYSTORY_TASKS_TABLE)
    await queryInterface.dropTable(PROYECT_TABLE)
    await queryInterface.dropTable(TASK_TABLE)
    await queryInterface.dropTable(FOLDER_TABLE)
    await queryInterface.dropTable(USER_TABLE)
  }
};
