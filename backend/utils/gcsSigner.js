const { Storage } = require('@google-cloud/storage');
const path = require('path');

const fs = require('fs');

let keyFilename = process.env.GCS_KEYFILE_PATH;
// Auto-detect local key for development if not provided in env
const localKeyPath = path.join(__dirname, '../../gcs-key.json');
if (!keyFilename && fs.existsSync(localKeyPath)) {
    keyFilename = localKeyPath;
}

const storage = new Storage({
    projectId: process.env.GCS_PROJECT_ID,
    keyFilename: keyFilename,
});

const bucketName = process.env.GCS_BUCKET_NAME || 'mews-uploads';
const bucket = storage.bucket(bucketName);

/**
 * Generates a signed URL for a given GCS file path or public URL.
 * valid for 60 minutes.
 * @param {string} fileUrlOrPath - The stored URL or filename
 * @returns {Promise<string>} - The signed URL
 */
const getSignedUrl = async (fileUrlOrPath) => {
    if (!fileUrlOrPath) return fileUrlOrPath;

    // Check for local uploads, static profiles, or remote URLs and return immediately
    if (fileUrlOrPath.startsWith('uploads/') ||
        fileUrlOrPath.startsWith('uploads\\') ||
        fileUrlOrPath.startsWith('/profiles') ||
        fileUrlOrPath.startsWith('http')) {
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
