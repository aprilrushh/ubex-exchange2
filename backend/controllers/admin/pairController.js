const { Pair } = require('../../models');

exports.listPairs = async (req, res) => {
  try {
    const pairs = await Pair.findAll({ order: [['id', 'ASC']] });
    res.json(pairs);
  } catch (err) {
    console.error('[pairController] listPairs error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPair = async (req, res) => {
  try {
    const pair = await Pair.findByPk(req.params.id);
    if (!pair) return res.status(404).json({ message: 'Not found' });
    res.json(pair);
  } catch (err) {
    console.error('[pairController] getPair error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createPair = async (req, res) => {
  try {
    const pair = await Pair.create(req.body);
    res.status(201).json(pair);
  } catch (err) {
    console.error('[pairController] createPair error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updatePair = async (req, res) => {
  try {
    const { id, ...data } = req.body;
    const [updated] = await Pair.update(data, { where: { id } });
    if (!updated) return res.status(404).json({ message: 'Not found' });
    const pair = await Pair.findByPk(id);
    res.json(pair);
  } catch (err) {
    console.error('[pairController] updatePair error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deletePair = async (req, res) => {
  try {
    const deleted = await Pair.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('[pairController] deletePair error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
