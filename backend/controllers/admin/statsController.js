const { Coin, User } = require('../../models');

exports.getStats = async (req, res) => {
  try {
    const coinCount = await Coin.count();
    const userCount = await User.count();
    res.json({ coinCount, userCount, tradingVolume24h: 0, orderCount24h: 0 });
  } catch (err) {
    console.error('getStats error', err);
    res.status(500).json({ message: 'Server error' });
  }
};
