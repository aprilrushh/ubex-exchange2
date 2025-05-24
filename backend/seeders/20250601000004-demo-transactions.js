'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('deposits', [
      { id: 1, wallet_id: 1, tx_hash: 'deposit_tx1', amount: 0.5, confirmed: true, created_at: new Date() }
    ], {});
    await queryInterface.bulkInsert('withdrawals', [
      { id: 1, wallet_id: 1, to_address: 'external_addr1', amount: 0.1, tx_hash: 'withdraw_tx1', status: 'CONFIRMED', created_at: new Date() }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('withdrawals', null, {});
    await queryInterface.bulkDelete('deposits', null, {});
  }
};
