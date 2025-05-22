const { Deposit, Withdrawal, Wallet, User } = require('../../models');
const { Op } = require('sequelize');

exports.listTransactions = async (req, res) => {
  try {
    const { type, status } = req.query;
    const deposits = (type === 'withdraw') ? [] : await Deposit.findAll();
    const withdrawals = (type === 'deposit') ? [] : await Withdrawal.findAll();
    let results = [];

    for (const d of deposits) {
      const wallet = await Wallet.findByPk(d.wallet_id);
      const user = wallet ? await User.findByPk(wallet.user_id) : null;
      results.push({
        id: `D${d.id}`,
        userId: user ? user.id : null,
        userEmail: user ? user.email : null,
        type: 'deposit',
        coin: wallet ? wallet.coin_symbol : null,
        amount: d.amount,
        status: d.confirmed ? 'completed' : 'pending',
        created_at: d.created_at
      });
    }

    for (const w of withdrawals) {
      const wallet = await Wallet.findByPk(w.wallet_id);
      const user = wallet ? await User.findByPk(wallet.user_id) : null;
      let s = w.status.toLowerCase();
      results.push({
        id: `W${w.id}`,
        userId: user ? user.id : null,
        userEmail: user ? user.email : null,
        type: 'withdraw',
        coin: wallet ? wallet.coin_symbol : null,
        amount: w.amount,
        status: s === 'confirmed' ? 'completed' : s,
        created_at: w.created_at
      });
    }

    if (status && status !== 'all') {
      results = results.filter(r => r.status === status);
    }

    res.json(results);
  } catch (err) {
    console.error('listTransactions error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTransaction = async (req, res) => {
  try {
    const id = req.params.id;
    let record;
    if (id.startsWith('D')) {
      const d = await Deposit.findByPk(id.slice(1));
      if (!d) return res.status(404).json({ message: 'Not found' });
      const wallet = await Wallet.findByPk(d.wallet_id);
      const user = wallet ? await User.findByPk(wallet.user_id) : null;
      record = {
        id: `D${d.id}`,
        userId: user ? user.id : null,
        userEmail: user ? user.email : null,
        type: 'deposit',
        coin: wallet ? wallet.coin_symbol : null,
        amount: d.amount,
        status: d.confirmed ? 'completed' : 'pending',
        created_at: d.created_at
      };
    } else {
      const w = await Withdrawal.findByPk(id.slice(1));
      if (!w) return res.status(404).json({ message: 'Not found' });
      const wallet = await Wallet.findByPk(w.wallet_id);
      const user = wallet ? await User.findByPk(wallet.user_id) : null;
      record = {
        id: `W${w.id}`,
        userId: user ? user.id : null,
        userEmail: user ? user.email : null,
        type: 'withdraw',
        coin: wallet ? wallet.coin_symbol : null,
        amount: w.amount,
        status: w.status.toLowerCase(),
        created_at: w.created_at
      };
    }
    res.json(record);
  } catch (err) {
    console.error('getTransaction error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (id.startsWith('W')) {
      const wid = id.slice(1);
      const [updated] = await Withdrawal.update({ status: status.toUpperCase() }, { where: { id: wid } });
      if (!updated) return res.status(404).json({ message: 'Not found' });
      const w = await Withdrawal.findByPk(wid);
      res.json(w);
    } else {
      res.status(400).json({ message: 'Only withdrawals updatable' });
    }
  } catch (err) {
    console.error('updateTransaction error', err);
    res.status(500).json({ message: 'Server error' });
  }
};
