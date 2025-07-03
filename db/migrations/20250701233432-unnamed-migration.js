'use strict';

const { USER_TABLE } = require('../models/userModel')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(USER_TABLE, 'refreshToken', { type: Sequelize.DataTypes.TEXT, allowNull: true, defaultValue: null })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn(USER_TABLE, 'refreshToken')
  }
};
