'use strict';

const { USER_TABLE } = require('../models/userModel');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(USER_TABLE, 'twitterId', { field: 'twitter_id', type: Sequelize.DataTypes.TEXT, allowNull: true })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn(USER_TABLE, 'twitterId')
  }
};
