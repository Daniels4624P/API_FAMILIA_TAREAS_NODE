'use strict';

const { USER_TABLE } = require('../models/userModel')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(USER_TABLE, 'recoveryTokenExpire', { field: 'recovery_token_expire', type: Sequelize.DataTypes.DATE, allowNull: true, defaultValue: null })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn(USER_TABLE, 'recoveryTokenExpire')
  }
};
