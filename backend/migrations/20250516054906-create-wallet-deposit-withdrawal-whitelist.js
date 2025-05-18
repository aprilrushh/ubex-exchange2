'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1) wallets
    await queryInterface.createTable('wallets', {
      id:          { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      user_id:     { type: Sequelize.BIGINT, allowNull: false, unique: 'user_coin' },
      coin_symbol: { type: Sequelize.STRING(10), allowNull: false, unique: 'user_coin' },
      address:     { type: Sequelize.STRING(128), allowNull: false },
      private_key:{ type: Sequelize.TEXT, allowNull: false },
      created_at:  { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // 2) deposits
    await queryInterface.createTable('deposits', {
      id:         { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      wallet_id:  { type: Sequelize.BIGINT, allowNull: false, references: { model: 'wallets', key: 'id' } },
      tx_hash:    { type: Sequelize.STRING(66), allowNull: false },
      amount:     { type: Sequelize.DECIMAL(36,18), allowNull: false },
      confirmed:  { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // 3) withdrawals
    await queryInterface.createTable('withdrawals', {
      id:          { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      wallet_id:   { type: Sequelize.BIGINT, allowNull: false, references: { model: 'wallets', key: 'id' } },
      to_address:  { type: Sequelize.STRING(128), allowNull: false },
      amount:      { type: Sequelize.DECIMAL(36,18), allowNull: false },
      tx_hash:     { type: Sequelize.STRING(66) },
      status:      { type: Sequelize.ENUM('PENDING','SENT','CONFIRMED','FAILED'),
                     allowNull: false, defaultValue: 'PENDING' },
      created_at:  { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // 4) whitelist_addresses
    await queryInterface.createTable('whitelist_addresses', {
      id:          { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      user_id:     { type: Sequelize.BIGINT, allowNull: false },
      coin_symbol: { type: Sequelize.STRING(10), allowNull: false },
      address:     { type: Sequelize.STRING(128), allowNull: false },
      label:       { type: Sequelize.STRING(50) },
      created_at:  { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('whitelist_addresses');
    await queryInterface.dropTable('withdrawals');
    await queryInterface.dropTable('deposits');
    await queryInterface.dropTable('wallets');
  }
};
