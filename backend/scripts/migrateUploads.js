const { Storage } = require('@google-cloud/storage');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const UPLOADS_DIR = path.join(__dirname, '../uploads');
// Bucket is pulled from env or hardcoded fallback matching your previous config
const BUCKET_NAME = process.env.GCS_BUCKET_NAME || 'mews-uploads';
const PROJECT_ID = process.env.GCS_PROJECT_ID || 'constant-height-480102-g2';
const KEY_FILE = path.join(__dirname, '../../gcs-key.json');

const storage = new Storage({
    projectId: PROJECT_ID,
    keyFilename: KEY_FILE,
});

const bucket = storage.bucket(BUCKET_NAME);

async function uploadFile(filename) {
    const filePath = path.join(UPLOADS_DIR, filename);

    try {
        await bucket.upload(filePath, {
            destination: filename,
            metadata: {
                cacheControl: 'public, max-age=31536000',
            },
        });
        console.log(`✅ Uploaded: ${filename}`);
        console.log(`   Public URL: https://storage.googleapis.com/${BUCKET_NAME}/${filename}`);

        // Optional: Delete local file after success?
        // fs.unlinkSync(filePath); 
    } catch (error) {
        console.error(`❌ Failed to upload ${filename}:`, error.message);
    }
}

async function main() {
    console.log(`🚀 Starting migration to bucket: ${BUCKET_NAME}`);

    if (!fs.existsSync(UPLOADS_DIR)) {
        console.error(`Uploads directory not found at ${UPLOADS_DIR}`);
        return;
    }

    const files = fs.readdirSync(UPLOADS_DIR);

    console.log(`Found ${files.length} files to migrate...`);

    for (const file of files) {
        // Skip hidden files or system files if necessary
        if (file.startsWith('.')) continue;

        await uploadFile(file);
    }

    console.log('🎉 Migration completed!');
}

main().catch(console.error);
