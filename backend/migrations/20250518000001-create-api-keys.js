'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('api_keys', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.BIGINT, allowNull: false },
      api_key: { type: Sequelize.STRING(64), allowNull: false, unique: true },
      api_secret: { type: Sequelize.STRING(64), allowNull: false },
      revoked: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('api_keys');
  }
};
