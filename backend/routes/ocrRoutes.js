const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadAndExtract } = require('../controllers/ocrController');

// Configure Multer to store file in memory for direct processing
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post('/extract', upload.single('document'), uploadAndExtract);

module.exports = router;
