const express = require('express');
const router = express.Router();
const controller = require('../controllers/admin/transactionController');

router.get('/', controller.listTransactions);
router.get('/:id', controller.getTransaction);
router.put('/:id', controller.updateTransaction);

module.exports = router;
