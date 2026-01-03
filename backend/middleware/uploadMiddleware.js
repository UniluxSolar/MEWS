const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Cloudinary Config
if (process.env.CLOUDINARY_CLOUD_NAME) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    console.log('[UPLOAD] Cloudinary Configured.');
}

// Local Disk Storage (Fallback)
const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Cloudinary Storage
let cloudStorage = null;
if (process.env.CLOUDINARY_CLOUD_NAME) {
    cloudStorage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'mews-uploads', // Folder in Cloudinary
            allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'],
            public_id: (req, file) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                return file.fieldname + '-' + uniqueSuffix;
            }
        },
    });
}

const storage = process.env.CLOUDINARY_CLOUD_NAME ? cloudStorage : diskStorage;

// File filter
const fileFilter = (req, file, cb) => {
    // console.log(`[UPLOAD DEBUG] Processing file: ${file.originalname}, Type: ${file.mimetype}`);
    cb(null, true);
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Set to 5MB
    fileFilter: fileFilter
});

module.exports = upload;
