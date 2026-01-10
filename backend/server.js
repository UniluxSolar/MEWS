require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
const fs = require('fs');

// Initialize Express App
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Body parser
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Form data parser
app.use('/uploads', express.static('uploads')); // Enabled for local files

// Basic Route
app.get('/', (req, res) => {
    res.send('MEWS API is running...');
});

// Define Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/locations', require('./routes/locationRoutes'));
app.use('/api/members', require('./routes/memberRoutes'));
app.use('/api/institutions', require('./routes/institutionRoutes'));

app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/fund-requests', require('./routes/fundRequestRoutes'));
app.use('/api/donations', require('./routes/donationRoutes'));

// Proxy Endpoint for Images (Fixes CORS for html2canvas & Private GCS Buckets)
const axios = require('axios');
const { Storage } = require('@google-cloud/storage');

// Initialize GCS for Proxy with Auto-detection
let keyFilename = process.env.GCS_KEYFILE_PATH;
const localKeyPath = path.join(__dirname, 'gcp-key.json');
const altLocalKeyPath = path.join(__dirname, 'gcs-key.json');

if (!keyFilename) {
    if (fs.existsSync(localKeyPath)) keyFilename = localKeyPath;
    else if (fs.existsSync(altLocalKeyPath)) keyFilename = altLocalKeyPath;
}

const storage = new Storage({
    projectId: process.env.GCS_PROJECT_ID,
    keyFilename: keyFilename
});
const bucketName = process.env.GCS_BUCKET_NAME || 'mews-uploads';
const bucket = storage.bucket(bucketName);

app.get('/api/proxy-image', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).send('URL is required');

    try {
        // Authenticated GCS Handling
        if (url.includes('storage.googleapis.com') && url.includes(bucketName)) {
            // Extract filename from URL: https://storage.googleapis.com/BUCKET_NAME/FILENAME
            const parts = url.split(`${bucketName}/`);
            if (parts.length > 1) {
                // Decode and strip any query parameters (e.g. signed URL params)
                const filename = decodeURIComponent(parts[1]).split('?')[0];

                if (!filename) return res.status(400).send('Invalid filename');

                const file = bucket.file(filename);

                const [exists] = await file.exists();
                if (!exists) {
                    console.error(`[Proxy] File not found in GCS: ${filename}`);
                    return res.status(404).send('Image not found in bucket');
                }

                // Get metadata for content-type
                const [metadata] = await file.getMetadata();
                res.setHeader('Content-Type', metadata.contentType || 'image/jpeg');
                // Cache control
                res.setHeader('Cache-Control', 'public, max-age=86400');

                // Stream the file
                return file.createReadStream()
                    .on('error', (err) => {
                        console.error(`[Proxy] Stream error for ${filename}:`, err.message);
                        if (!res.headersSent) res.status(500).send('Stream error');
                    })
                    .pipe(res);
            }
        }

        // Fallback for public URLs
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        });

        res.setHeader('Content-Type', response.headers['content-type']);
        response.data.pipe(res);

    } catch (error) {
        console.error(`[Proxy Error] URL: ${url} | Message: ${error.message}`);
        if (error.response) {
            res.status(error.response.status).send(error.response.statusText);
        } else {
            res.status(500).send('Failed to fetch image');
        }
    }
});

const { errorHandler } = require('./middleware/errorMiddleware');
app.use(errorHandler);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
