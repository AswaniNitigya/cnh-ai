const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const { triggerScraper, getStats, getUsers } = require('../controllers/admin.controller');

// Super Admin only routes
router.get('/trigger-scraper', verifyToken, requireRole('super_admin'), triggerScraper);
router.get('/stats', verifyToken, requireRole('super_admin', 'faculty'), getStats);
router.get('/users', verifyToken, requireRole('super_admin'), getUsers);

module.exports = router;
