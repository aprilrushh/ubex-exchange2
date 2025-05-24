const { Coin } = require('../models');

exports.listCoins = async (req, res) => {
  try {
    const coins = await Coin.findAll({ where: { active: true }, order: [['id', 'ASC']] });
    res.json(coins);
  } catch (err) {
    console.error('[coinController] listCoins error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
