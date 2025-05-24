'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('pairs', [
      { id: 1, base: 'BTC', quote: 'USDT', fee: 0.001, active: true, created_at: new Date(), updated_at: new Date() },
      { id: 2, base: 'ETH', quote: 'USDT', fee: 0.001, active: true, created_at: new Date(), updated_at: new Date() },
      { id: 3, base: 'BTC', quote: 'KRW', fee: 0.001, active: true, created_at: new Date(), updated_at: new Date() }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('pairs', null, {});
  }
};
