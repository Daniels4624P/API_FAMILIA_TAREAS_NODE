'use strict';

const { USER_TABLE } = require('../models/userModel');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn(USER_TABLE, 'recoveryTokenExpire', 'recovery_token_expire');
    await queryInterface.renameColumn(USER_TABLE, 'refreshToken', 'refresh_token');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn(USER_TABLE, 'recovery_token_expire', 'recoveryTokenExpire');
    await queryInterface.renameColumn(USER_TABLE, 'refresh_token', 'refreshToken');
  }
};