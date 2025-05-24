// backend/routes/apiKeyRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/apiKeyController');
const auth = require('../middlewares/authMiddleware');

router.post('/', auth, controller.createKey);
router.get('/', auth, controller.listKeys);
router.delete('/:id', auth, controller.revokeKey);

module.exports = router;
