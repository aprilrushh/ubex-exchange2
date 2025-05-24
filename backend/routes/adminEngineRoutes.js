const express = require('express');
const router = express.Router();
const auth = require('../middlewares/adminAuth');
const controller = require('../controllers/admin/engineController');

router.use(auth);
router.get('/orders', controller.listOrders);
router.get('/trades', controller.listTrades);

module.exports = router;
