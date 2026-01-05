require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

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
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Proxy Endpoint for Images (Fixes CORS for html2canvas & Private GCS Buckets)
const axios = require('axios');
const { Storage } = require('@google-cloud/storage');

// Initialize GCS for Proxy
const storage = new Storage({
    projectId: process.env.GCS_PROJECT_ID,
    keyFilename: process.env.GCS_KEYFILE_PATH
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
                const filename = decodeURIComponent(parts[1]);
                const file = bucket.file(filename);

                const [exists] = await file.exists();
                if (!exists) {
                    // console.log(`[Proxy] GCS File not found: ${filename}`);
                    return res.status(404).send('Image not found in bucket');
                }

                // Get metadata for content-type
                const [metadata] = await file.getMetadata();
                res.set('Content-Type', metadata.contentType || 'image/jpeg');

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

        res.set('Content-Type', response.headers['content-type']);
        response.data.pipe(res);

    } catch (error) {
        // console.error(`Proxy Error for ${url}:`, error.message);
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
