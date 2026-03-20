const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const { triggerScraper, getStats, getUsers, getPendingUsers, approveUser, rejectUser } = require('../controllers/admin.controller');

// Super Admin only routes
router.post('/trigger-scraper', verifyToken, requireRole('super_admin'), triggerScraper);
router.get('/stats', verifyToken, requireRole('super_admin', 'faculty'), getStats);
router.get('/users', verifyToken, requireRole('super_admin'), getUsers);

router.get('/users/pending', verifyToken, requireRole('super_admin'), getPendingUsers);
router.post('/users/:id/approve', verifyToken, requireRole('super_admin'), approveUser);
router.post('/users/:id/reject', verifyToken, requireRole('super_admin'), rejectUser);

module.exports = router;
