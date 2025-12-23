const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const { Storage } = require('@google-cloud/storage');

// Initialize GCS
const storageClient = new Storage({
    projectId: process.env.GCS_PROJECT_ID,
    // keyFilename is only needed for local dev if not using ADC. 
    // On Cloud Run, it uses the attached service account automatically.
    keyFilename: process.env.GCS_KEYFILE_PATH,
});

const bucketName = process.env.GCS_BUCKET_NAME || 'mews-uploads';
const bucket = storageClient.bucket(bucketName);

// Custom Multer Storage Engine
const GCSStorage = {
    _handleFile: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
        const blob = bucket.file(filename);

        const blobStream = blob.createWriteStream({
            resumable: false,
            contentType: file.mimetype,
            // public: true, // Only if bucket is uniform bucket-level access is disabled? 
            // Better to relying on bucket being public or make file public explicitly
        });

        blobStream.on('error', (err) => {
            console.error('GCS Upload Error:', err);
            cb(err);
        });

        blobStream.on('finish', () => {
            // The public URL can be constructed
            const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;
            cb(null, {
                path: publicUrl, // Map to 'path' so controller code works without changes
                filename: filename
            });
        });

        file.stream.pipe(blobStream);
    },
    _removeFile: (req, file, cb) => {
        // Optional: Implement deletion if needed
        cb(null);
    }
};

const storage = GCSStorage;

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
