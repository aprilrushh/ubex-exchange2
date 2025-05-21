const express = require('express');
const router = express.Router();
const coinController = require('../controllers/admin/coinController');

router.get('/', coinController.listCoins);
router.get('/:id', coinController.getCoin);
router.post('/', coinController.createCoin);
router.put('/', coinController.updateCoin);
router.delete('/:id', coinController.deleteCoin);

module.exports = router;
