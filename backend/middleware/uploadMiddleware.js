const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');

// GCS Configuration from Utils (Shared logic)
const bucketName = process.env.GCS_BUCKET_NAME || 'mews-uploads';
const storageClient = new Storage({
    projectId: process.env.GCS_PROJECT_ID,
    keyFilename: process.env.GCS_KEYFILE_PATH // Optional if running in GCP environment
});
const bucket = storageClient.bucket(bucketName);

// Custom Multer Storage Engine for GCS
class GoogleCloudStorageEngine {
    constructor(opts) {
        this.getDestination = (req, file, cb) => {
            cb(null, 'uploads/'); // Default prefix
        }
    }

    _handleFile = (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
        const blob = bucket.file(filename);

        const blobStream = blob.createWriteStream({
            resumable: false,
            metadata: {
                contentType: file.mimetype,
            },
        });

        blobStream.on('error', (err) => {
            cb(err);
        });

        blobStream.on('finish', () => {
            // The public URL can be constructed if the object is public, 
            // OR we just save the GCS URI/filename and sign it on retrieval (as gcsSigner.js suggests).
            // format: https://storage.googleapis.com/BUCKET_NAME/FILENAME
            const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;

            cb(null, {
                path: publicUrl, // Save URL to 'path' property to match diskStorage API
                filename: filename,
                size: blobStream.bytesWritten
            });
        });

        file.stream.pipe(blobStream);
    }

    _removeFile = (req, file, cb) => {
        bucket.file(file.filename).delete();
        cb(null);
    }
}

// Local Disk Storage
const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Select Storage: GCS if credentials exist, else Local
// Check for GCS_PROJECT_ID as a signal to use GCS
const storage = process.env.GCS_PROJECT_ID ? new GoogleCloudStorageEngine() : diskStorage;

if (process.env.GCS_PROJECT_ID) {
    console.log('[UPLOAD] Using Google Cloud Storage');
} else {
    console.log('[UPLOAD] Using Local Disk Storage');
}

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
