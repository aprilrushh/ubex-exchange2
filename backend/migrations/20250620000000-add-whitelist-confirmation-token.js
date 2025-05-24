'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('whitelist_addresses', 'status', {
      type: Sequelize.ENUM('pending', 'confirmed'),
      allowNull: false,
      defaultValue: 'pending'
    });
    await queryInterface.addColumn('whitelist_addresses', 'confirmed_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.createTable('whitelist_confirmation_tokens', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      token: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      user_id: { type: Sequelize.BIGINT, allowNull: false },
      whitelist_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'whitelist_addresses', key: 'id' }, onDelete: 'CASCADE' },
      expires_at: { type: Sequelize.DATE, allowNull: false },
      used: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('whitelist_confirmation_tokens');
    await queryInterface.removeColumn('whitelist_addresses', 'confirmed_at');
    await queryInterface.removeColumn('whitelist_addresses', 'status');
  }
};
