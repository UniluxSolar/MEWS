const { Storage } = require('@google-cloud/storage');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const checkGcsForMissingFiles = async () => {
    // Use absolute paths to avoid ambiguity
    let keyFilename = process.env.GCS_KEYFILE_PATH;
    const backendDir = path.join(__dirname, '..');
    const absoluteKeyPath = path.join(backendDir, 'gcp-key.json');

    console.log(`Checking for key at: ${absoluteKeyPath}`);
    if (fs.existsSync(absoluteKeyPath)) {
        keyFilename = absoluteKeyPath;
    } else {
        console.warn(`Key file NOT found at ${absoluteKeyPath}`);
    }

    let storageOptions = { projectId: process.env.GCS_PROJECT_ID };
    if (keyFilename) {
        storageOptions.keyFilename = keyFilename;
    }

    try {
        const storage = new Storage(storageOptions);
        const bucketName = process.env.GCS_BUCKET_NAME || 'mews-uploads';
        const bucket = storage.bucket(bucketName);

        const filesToCheck = [
            'photo-1769692444269-590888823.png',
            'familyMemberPhotos-1769692444284-278984270.png',
            'photo-1769751736959-46325674.jpg'
        ];

        console.log(`Checking GCS Bucket: ${bucketName}\n`);

        for (const filename of filesToCheck) {
            const file = bucket.file(filename);
            const [exists] = await file.exists();
            console.log(`- ${filename}: ${exists ? 'EXISTS in GCS' : 'NOT FOUND in GCS'}`);
        }

    } catch (error) {
        console.error(`Error: ${error.message}`);
    }

    process.exit();
};

checkGcsForMissingFiles();
