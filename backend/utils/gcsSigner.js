const { Storage } = require('@google-cloud/storage');
const path = require('path');

const fs = require('fs');

let keyFilename = process.env.GCS_KEYFILE_PATH;
// Auto-detect local key for development if not provided in env
const localKeyPath = path.join(__dirname, '../gcp-key.json'); // Corrected: One level up from utils to backend
// Also try the gcs-key.json just in case
const altLocalKeyPath = path.join(__dirname, '../gcs-key.json');
if (!keyFilename) {
    if (fs.existsSync(localKeyPath)) keyFilename = localKeyPath;
    else if (fs.existsSync(altLocalKeyPath)) keyFilename = altLocalKeyPath;
}

let storage;
let bucket;
const bucketName = process.env.GCS_BUCKET_NAME || 'mews-uploads';

// Graceful Init
try {
    let storageOptions = { projectId: process.env.GCS_PROJECT_ID };

    if (process.env.GCS_CREDENTIALS) {
        // Production: Use Env Var with JSON content
        const credentials = JSON.parse(process.env.GCS_CREDENTIALS);
        storageOptions.credentials = credentials;
        console.log(`[GCS] Initialized with GCS_CREDENTIALS env var`);
    } else if (keyFilename && fs.existsSync(keyFilename)) {
        // Development: Use Key File
        storageOptions.keyFilename = keyFilename;
        console.log(`[GCS] Initialized with key: ${keyFilename}`);
    } else {
        throw new Error("No GCS credentials found (GCS_CREDENTIALS or key file)");
    }

    storage = new Storage(storageOptions);
    bucket = storage.bucket(bucketName);
} catch (e) {
    console.warn(`[GCS] Initialization Warning: ${e.message}. Image signing disabled.`);
    // Leave bucket undefined so we fail safely later
}

/**
 * Generates a signed URL for a given GCS file path or public URL.
 * valid for 60 minutes.
 * @param {string} fileUrlOrPath - The stored URL or filename
 * @returns {Promise<string>} - The signed URL
 */
const getSignedUrl = async (fileUrlOrPath) => {
    if (!fileUrlOrPath) return fileUrlOrPath;

    // Check for local uploads, static profiles, or remote URLs and return immediately
    // Normalize path for local uploads (Windows fix)
    let normalizedPath = fileUrlOrPath;
    if (typeof fileUrlOrPath === 'string') {
        normalizedPath = fileUrlOrPath.replace(/\\/g, '/');
    }

    if (normalizedPath.startsWith('uploads/') ||
        normalizedPath.startsWith('/uploads/') ||
        normalizedPath.startsWith('/profiles') ||
        normalizedPath.startsWith('http')) {

        // Ensure local uploads start with / so they are treated as root-relative on frontend
        if (normalizedPath.startsWith('uploads/')) {
            return '/' + normalizedPath;
        }
        return normalizedPath;
    }

    // Safety Check: If bucket is not initialized (key missing), we cannot sign.
    if (!bucket) {
        // console.warn(`[GCS] Cannot sign URL for ${fileUrlOrPath} because bucket is not initialized.`);
        return fileUrlOrPath;
    }

    try {
        // 1. Extract filename if it's a full URL
        let filename = fileUrlOrPath;
        if (fileUrlOrPath.includes('storage.googleapis.com')) {
            const parts = fileUrlOrPath.split(`${bucketName}/`);
            if (parts.length > 1) {
                filename = parts[1];
            }
        }

        // If it still looks like a url but didn't match bucket name (edge case), try split by slash
        if (filename.includes('/')) {
            filename = filename.split('/').pop();
        }

        // 2. Generate Signed URL
        const [url] = await bucket.file(filename).getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: Date.now() + 60 * 60 * 1000, // 60 minutes
        });

        return url;
    } catch (error) {
        console.error(`Error signing URL for ${fileUrlOrPath}:`, error.message);
        return fileUrlOrPath; // Fallback to original if signing fails
    }
};

module.exports = { getSignedUrl };
