// backend/controllers/apiKeyController.js
const apiKeyService = require('../services/apiKeyService');

exports.createKey = async (req, res) => {
  try {
    const result = await apiKeyService.createKey(req.user.id);
    res.status(201).json(result);
  } catch (err) {
    console.error('createKey error', err);
    res.status(500).json({ message: 'Failed to create API key' });
  }
};

exports.listKeys = async (req, res) => {
  try {
    const keys = await apiKeyService.listKeys(req.user.id);
    res.json(keys);
  } catch (err) {
    console.error('listKeys error', err);
    res.status(500).json({ message: 'Failed to fetch keys' });
  }
};

exports.revokeKey = async (req, res) => {
  try {
    const success = await apiKeyService.revokeKey(req.user.id, req.params.id);
    if (success) res.json({ success: true });
    else res.status(404).json({ message: 'Not found' });
  } catch (err) {
    console.error('revokeKey error', err);
    res.status(500).json({ message: 'Failed to revoke key' });
  }
};
