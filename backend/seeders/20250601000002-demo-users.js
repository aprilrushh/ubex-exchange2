'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('users', [
      { id: 1, username: 'alice', email: 'alice@example.com', password: '$2b$10$uka0HHb2HCMVmYC17uMQreyn7THGLZ0sXANkI3UrIVKDbVL3qn6ii', created_at: new Date(), updated_at: new Date() },
      { id: 2, username: 'bob', email: 'bob@example.com', password: '$2b$10$uka0HHb2HCMVmYC17uMQreyn7THGLZ0sXANkI3UrIVKDbVL3qn6ii', created_at: new Date(), updated_at: new Date() }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
  }
};
