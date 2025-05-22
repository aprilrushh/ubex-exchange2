const { User, Wallet, Deposit, Withdrawal } = require('../../models');

exports.listUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: ['id', 'username', 'email', 'created_at'] });
    res.json(users);
  } catch (err) {
    console.error('listUsers error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, { attributes: ['id', 'username', 'email', 'created_at'] });
    if (!user) return res.status(404).json({ message: 'Not found' });
    const wallets = await Wallet.findAll({ where: { user_id: user.id } });
    const walletIds = wallets.map(w => w.id);
    const deposits = await Deposit.findAll({ where: { wallet_id: walletIds } });
    const withdrawals = await Withdrawal.findAll({ where: { wallet_id: walletIds } });
    res.json({ user, wallets, deposits, withdrawals });
  } catch (err) {
    console.error('getUser error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await User.update(req.body, { where: { id } });
    if (!updated) return res.status(404).json({ message: 'Not found' });
    const user = await User.findByPk(id, { attributes: ['id', 'username', 'email', 'created_at'] });
    res.json(user);
  } catch (err) {
    console.error('updateUser error', err);
    res.status(500).json({ message: 'Server error' });
  }
};
