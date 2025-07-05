'use strict';

const { USER_TABLE } = require('../models/userModel');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(USER_TABLE, 'authProvider', { field: 'auth_provider', type: Sequelize.DataTypes.TEXT, allowNull: true })
    await queryInterface.addColumn(USER_TABLE, 'googleId', { field: 'google_id', type: Sequelize.DataTypes.TEXT, allowNull: true })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn(USER_TABLE, 'authProvider')
    await queryInterface.removeColumn(USER_TABLE, 'googleId')
  }
};
