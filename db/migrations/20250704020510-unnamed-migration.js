'use strict';

const { USER_TABLE } = require('../models/userModel');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn(USER_TABLE, 'password', { allowNull: true, type: Sequelize.DataTypes.STRING })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn(USER_TABLE, 'password', { allowNull: false, type: Sequelize.DataTypes.STRING })
  }
};
