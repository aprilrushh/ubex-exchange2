const { Coin } = require('../../models');

exports.listCoins = async (req, res) => {
  try {
    const coins = await Coin.findAll({ order: [['id', 'ASC']] });
    res.json(coins);
  } catch (err) {
    console.error('[coinController] listCoins error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCoin = async (req, res) => {
  try {
    const coin = await Coin.findByPk(req.params.id);
    if (!coin) return res.status(404).json({ message: 'Not found' });
    res.json(coin);
  } catch (err) {
    console.error('[coinController] getCoin error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createCoin = async (req, res) => {
  try {
    const coin = await Coin.create(req.body);
    res.status(201).json(coin);
  } catch (err) {
    console.error('[coinController] createCoin error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateCoin = async (req, res) => {
  try {
    const { id, ...data } = req.body;
    const [updated] = await Coin.update(data, { where: { id } });
    if (!updated) return res.status(404).json({ message: 'Not found' });
    const coin = await Coin.findByPk(id);
    res.json(coin);
  } catch (err) {
    console.error('[coinController] updateCoin error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteCoin = async (req, res) => {
  try {
    const deleted = await Coin.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('[coinController] deleteCoin error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
