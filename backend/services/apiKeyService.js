// backend/services/apiKeyService.js
const crypto = require('crypto');
const { ApiKey } = require('../models');

function generate() {
  return crypto.randomBytes(32).toString('hex');
}

async function createKey(userId) {
  const apiKey = generate();
  const apiSecret = generate();
  const record = await ApiKey.create({ user_id: userId, api_key: apiKey, api_secret: apiSecret });
  return { id: record.id, apiKey, apiSecret };
}

async function listKeys(userId) {
  return ApiKey.findAll({ where: { user_id: userId, revoked: false }, attributes: ['id','api_key','created_at'] });
}

async function revokeKey(userId, id) {
  const [updated] = await ApiKey.update({ revoked: true }, { where: { id, user_id: userId } });
  return updated > 0;
}

module.exports = { createKey, listKeys, revokeKey };
