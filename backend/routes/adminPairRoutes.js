const express = require('express');
const router = express.Router();
const pairController = require('../controllers/admin/pairController');

router.get('/', pairController.listPairs);
router.get('/:id', pairController.getPair);
router.post('/', pairController.createPair);
router.put('/', pairController.updatePair);
router.delete('/:id', pairController.deletePair);

module.exports = router;
