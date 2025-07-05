'use strict';

const { USER_TABLE } = require('../models/userModel')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn(USER_TABLE, 'googleId', 'google_id')
    await queryInterface.renameColumn(USER_TABLE, 'authProvider', 'auth_provider')
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn(USER_TABLE, 'google_id', 'googleId')
    await queryInterface.renameColumn(USER_TABLE, 'auth_provider', 'authProvider')
  }
};
