'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('coins', [
      { id: 1, symbol: 'BTC', name: 'Bitcoin', decimals: 8, active: true, created_at: new Date(), updated_at: new Date() },
      { id: 2, symbol: 'ETH', name: 'Ethereum', decimals: 18, active: true, created_at: new Date(), updated_at: new Date() },
      { id: 3, symbol: 'USDT', name: 'Tether', decimals: 6, active: true, created_at: new Date(), updated_at: new Date() },
      { id: 4, symbol: 'KRW', name: 'Korean Won', decimals: 0, active: true, created_at: new Date(), updated_at: new Date() }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('coins', null, {});
  }
};
