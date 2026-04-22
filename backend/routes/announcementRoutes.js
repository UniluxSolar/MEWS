const express = require('express');
const router = express.Router();
const { createAnnouncement, getAnnouncements } = require('../controllers/announcementController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .get(protect, getAnnouncements);

router.post('/create', protect, upload.array('attachments', 10), createAnnouncement);

module.exports = router;
