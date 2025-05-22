const express = require('express');
const router = express.Router();
const controller = require('../controllers/admin/userController');

router.get('/', controller.listUsers);
router.get('/:id', controller.getUser);
router.put('/:id', controller.updateUser);

module.exports = router;
