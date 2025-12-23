const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const multerGoogleStorage = require('multer-google-storage');

// Configure GCS storage
const storage = multerGoogleStorage.storageEngine({
    bucket: process.env.GCS_BUCKET_NAME || 'mews-uploads', // Default to what user showed if env missing
    projectId: process.env.GCS_PROJECT_ID,
    keyFilename: process.env.GCS_KEYFILE_PATH, // Optional: for local dev. Cloud Run uses auto-auth.
    filename: function (req, file, cb) {
        // Create unique filename: fieldname-timestamp-random.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
    acl: 'publicRead', // Ensure files are public if your app requires public URLs
    contentType: (req, file) => {
        return file.mimetype;
    }
});

// File filter (optional but good)
// File filter
const fileFilter = (req, file, cb) => {
    console.log(`[UPLOAD DEBUG] Processing file: ${file.originalname}, Type: ${file.mimetype}`);
    cb(null, true);
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // Increased to 50MB to handle high-res photos
    fileFilter: fileFilter
});

module.exports = upload;
