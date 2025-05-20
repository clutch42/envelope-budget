'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Envelopes', [
      { name: 'Rent', balance: 1200.00, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Groceries', balance: 300.00, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Utilities', balance: 150.00, createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Envelopes', null, {});
  }
};
