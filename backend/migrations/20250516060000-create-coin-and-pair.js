'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('coins', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      symbol: { type: Sequelize.STRING(10), allowNull: false, unique: true },
      name: { type: Sequelize.STRING(50), allowNull: false },
      decimals: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 8 },
      active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.createTable('pairs', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      base: { type: Sequelize.STRING(10), allowNull: false },
      quote: { type: Sequelize.STRING(10), allowNull: false },
      fee: { type: Sequelize.DECIMAL(10,4), allowNull: false, defaultValue: 0 },
      active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('pairs');
    await queryInterface.dropTable('coins');
  }
};
