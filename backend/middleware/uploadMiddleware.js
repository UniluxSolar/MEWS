const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Create unique filename: fieldname-timestamp-e.g-document.jpg
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter (optional but good)
const fileFilter = (req, file, cb) => {
    console.log(`[UPLOAD DEBUG] Processing file. Name: ${file.originalname}, MimeType: ${file.mimetype}, Size: ${req.headers['content-length']}`);

    // Temporarily allowing ALL files to bypass the "Images and PDFs only" error
    // We will inspect the logs to see what the actual mimetype is
    return cb(null, true);

    /* Original strict filter
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Images and PDFs only!'));
    }
    */
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // Increased to 50MB to handle high-res photos
    fileFilter: fileFilter
});

module.exports = upload;
