const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const authenticate = require('../auth/authMiddleware');

router.post('/', authenticate, alertController.sendAlert);
router.get('/', authenticate, alertController.getAllAlerts);
router.post('/alerts/panic', authenticate, alertController.panicUpdate);

module.exports = router;
