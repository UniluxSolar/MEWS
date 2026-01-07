const { Storage } = require('@google-cloud/storage');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// GCS Configuration with Key Auto-detection
let keyFilename = process.env.GCS_KEYFILE_PATH;
const localKeyPath = path.join(__dirname, '../gcp-key.json');
const altLocalKeyPath = path.join(__dirname, '../gcs-key.json');

let projectId = process.env.GCS_PROJECT_ID;

if (!keyFilename) {
    if (fs.existsSync(localKeyPath)) keyFilename = localKeyPath;
    else if (fs.existsSync(altLocalKeyPath)) keyFilename = altLocalKeyPath;
}

// Extract Project ID from key file if not in env
if (keyFilename && !projectId && fs.existsSync(keyFilename)) {
    try {
        const keyFileContent = JSON.parse(fs.readFileSync(keyFilename, 'utf8'));
        if (keyFileContent.project_id) {
            projectId = keyFileContent.project_id;
            console.log(`[UPLOAD] Auto-detected Project ID: ${projectId}`);
        }
    } catch (e) {
        console.error('[UPLOAD] Failed to parse key file for Project ID:', e.message);
    }
}

const bucketName = process.env.GCS_BUCKET_NAME || 'mews-uploads';
let storageClient;
let bucket;

if (projectId && keyFilename) {
    try {
        storageClient = new Storage({
            projectId: projectId,
            keyFilename: keyFilename
        });
        bucket = storageClient.bucket(bucketName);
        console.log(`[UPLOAD] Initialized GCS Bucket: ${bucketName}`);
    } catch (e) {
        console.error('[UPLOAD] Failed to initialize GCS:', e.message);
    }
} else {
    // console.warn('[UPLOAD] GCS Credentials missing. Falling back to local storage (if not forced).');
}

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

// Select Storage: GCS if credentials exist and bucket is ready, else Local
// Check for initialized bucket as a signal to use GCS
const isGcsReady = !!bucket;
const storage = isGcsReady ? new GoogleCloudStorageEngine() : diskStorage;

if (isGcsReady) {
    console.log('[UPLOAD] Using Google Cloud Storage');
} else {
    console.log('[UPLOAD] Using Local Disk Storage (GCS credentials not found)');
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
