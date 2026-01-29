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

try {
    let storageOptions = { projectId: projectId || process.env.GCS_PROJECT_ID };
    let initialized = false;

    if (process.env.GCS_CREDENTIALS) {
        // Production: Use Env Var
        storageOptions.credentials = JSON.parse(process.env.GCS_CREDENTIALS);
        console.log('[UPLOAD] Using GCS_CREDENTIALS from env');
        initialized = true;
    } else if (keyFilename && fs.existsSync(keyFilename)) {
        // Development: Use Key File
        storageOptions.keyFilename = keyFilename;
        console.log(`[UPLOAD] Using key file: ${keyFilename}`);
        initialized = true;
    }

    if (initialized) {
        storageClient = new Storage(storageOptions);
        bucket = storageClient.bucket(bucketName);
        console.log(`[UPLOAD] Initialized GCS Bucket: ${bucketName}`);
    } else {
        console.warn('[UPLOAD] GCS Credentials missing (No GCS_CREDENTIALS or key file). Falling back to local storage.');
    }
} catch (e) {
    console.error('[UPLOAD] Failed to initialize GCS:', e.message);
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
    limits: { fileSize: 50 * 1024 * 1024 }, // Set to 50MB to match server limits
    fileFilter: fileFilter
});

module.exports = upload;
