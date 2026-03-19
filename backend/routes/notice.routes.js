const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const {
  getFeed,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
  searchNotices
} = require('../controllers/notice.controller');
const { processOCR } = require('../controllers/ocr.controller');

// Multer config for OCR uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('Only image and PDF files are allowed.'));
  }
});

// Student feed (auth required)
router.get('/feed', verifyToken, getFeed);

// Search notices
router.get('/search', verifyToken, searchNotices);

// Get single notice
router.get('/:id', verifyToken, getNoticeById);

// Post notice (Faculty/CR/Admin)
router.post('/manual', verifyToken, requireRole('super_admin', 'faculty', 'cr'), createNotice);

// OCR upload (Admin/Faculty)
router.post('/ocr-upload', verifyToken, requireRole('super_admin', 'faculty'), upload.single('image'), processOCR);

// Update notice
router.put('/:id', verifyToken, requireRole('super_admin', 'faculty', 'cr'), updateNotice);

// Archive notice
router.delete('/:id', verifyToken, requireRole('super_admin', 'faculty'), deleteNotice);

module.exports = router;
