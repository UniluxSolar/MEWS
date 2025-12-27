const express = require('express');
const router = express.Router();
const { createAnnouncement, getAnnouncements } = require('../controllers/announcementController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createAnnouncement)
    .get(protect, getAnnouncements);

module.exports = router;
