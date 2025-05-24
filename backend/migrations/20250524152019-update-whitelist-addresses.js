'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('whitelist_addresses', 'status', {
      type: Sequelize.ENUM('pending','confirmed','rejected'),
      allowNull: false,
      defaultValue: 'pending'
    });
    await queryInterface.addColumn('whitelist_addresses', 'confirmed_at', {
      type: Sequelize.DATE,
      allowNull: true
    });
    await queryInterface.addColumn('whitelist_addresses', 'last_used_at', {
      type: Sequelize.DATE,
      allowNull: true
    });
    await queryInterface.addIndex('whitelist_addresses', ['user_id', 'coin_symbol', 'address'], {
      unique: true,
      name: 'whitelist_user_coin_address_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('whitelist_addresses', 'whitelist_user_coin_address_unique');
    await queryInterface.removeColumn('whitelist_addresses', 'last_used_at');
    await queryInterface.removeColumn('whitelist_addresses', 'confirmed_at');
    await queryInterface.removeColumn('whitelist_addresses', 'status');
  }
};
