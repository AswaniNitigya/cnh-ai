const express = require('express');
const router = express.Router();
const { getPublicKey, subscribe, getNotifications, markRead } = require('../controllers/push.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.get('/public-key', getPublicKey);
router.post('/subscribe', verifyToken, subscribe);
router.get('/notifications', verifyToken, getNotifications);
router.put('/:id/read', verifyToken, markRead);

module.exports = router;
