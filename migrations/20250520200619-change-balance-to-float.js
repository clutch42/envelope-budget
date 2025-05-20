'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Envelopes', 'balance', {
      type: Sequelize.FLOAT,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Envelopes', 'balance', {
      type: Sequelize.DECIMAL,
    });
  }
};
