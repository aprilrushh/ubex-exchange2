'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('wallets', [
      { id: 1, user_id: 1, coin_symbol: 'BTC', address: 'alice_btc_addr', private_key: 'alice_btc_pk', created_at: new Date() },
      { id: 2, user_id: 1, coin_symbol: 'USDT', address: 'alice_usdt_addr', private_key: 'alice_usdt_pk', created_at: new Date() },
      { id: 3, user_id: 2, coin_symbol: 'BTC', address: 'bob_btc_addr', private_key: 'bob_btc_pk', created_at: new Date() },
      { id: 4, user_id: 2, coin_symbol: 'USDT', address: 'bob_usdt_addr', private_key: 'bob_usdt_pk', created_at: new Date() }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('wallets', null, {});
  }
};
