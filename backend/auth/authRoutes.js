const express = require('express');
const router = express.Router();
const authController = require('./authController');

// Route login dan register
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/login', authController.login);


module.exports = router;
