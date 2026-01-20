require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');

// Initialize Express App
const app = express();

// Trust Proxy (Required for Cloud Run / Heroku to correctly identify HTTPS)
app.set('trust proxy', 1);

// Connect to Database
// Connect to Database
// Non-blocking connection to allow server to bind port even if DB fails initially (Cloud Run Health Check Strategy)
connectDB().catch(err => console.error('[DB] Connection Failure:', err.message));

// Ensure 'uploads' directory exists (Critical for GCP/Containers)
const uploadsDir = path.join(__dirname, 'uploads');
try {
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir);
        // console.log(`[Init] Created uploads directory at ${uploadsDir}`);
    }
} catch (err) {
    console.warn(`[Init] Warning: Could not create uploads directory: ${err.message}`);
}

// Middleware
app.use(cors({
    origin: true, // Allow requests from any origin that matches (useful for dev/staging)
    credentials: true // Allow cookies to be sent
}));
app.use(express.json({ limit: '50mb' })); // Body parser
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Form data parser
app.use(cookieParser()); // Cookie parser
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Enabled for local files with absolute path

// Basic Route
// Basic Route (handled in production block below)
// app.get('/', (req, res) => {
//     res.send('MEWS API is running...');
// });

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
// Initialize GCS for Proxy with Auto-detection
let keyFilename = process.env.GCS_KEYFILE_PATH;
const localKeyPath = path.join(__dirname, 'gcp-key.json');
const altLocalKeyPath = path.join(__dirname, 'gcs-key.json');

if (!keyFilename) {
    if (fs.existsSync(localKeyPath)) keyFilename = localKeyPath;
    else if (fs.existsSync(altLocalKeyPath)) keyFilename = altLocalKeyPath;
}

// Storage Configuration
let storageOptions = { projectId: process.env.GCS_PROJECT_ID };

if (process.env.GCS_CREDENTIALS) {
    try {
        storageOptions.credentials = JSON.parse(process.env.GCS_CREDENTIALS);
        // console.log('[Proxy] Using GCS_CREDENTIALS from env');
    } catch (e) {
        console.error('[Proxy] Failed to parse GCS_CREDENTIALS:', e);
    }
} else if (keyFilename && fs.existsSync(keyFilename)) {
    storageOptions.keyFilename = keyFilename;
    // console.log(`[Proxy] Using key file: ${keyFilename}`);
}

const storage = new Storage(storageOptions);
const bucketName = process.env.GCS_BUCKET_NAME || 'mews-uploads';
const bucket = storage.bucket(bucketName);

app.get('/api/proxy-image', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).send('URL is required');

    try {
        let servedViaGcs = false;

        // AUTHENTICATED GCS HANDLING (Attempt First)
        if (url.includes('storage.googleapis.com') && url.includes(bucketName)) {
            try {
                // Extract filename from URL: https://storage.googleapis.com/BUCKET_NAME/FILENAME
                const parts = url.split(`${bucketName}/`);
                if (parts.length > 1) {
                    // Decode and strip any query parameters (e.g. signed URL params)
                    const filename = decodeURIComponent(parts[1]).split('?')[0];

                    if (filename && bucket) {
                        const file = bucket.file(filename);
                        const [exists] = await file.exists();

                        if (exists) {
                            // Get metadata for content-type
                            const [metadata] = await file.getMetadata();
                            res.setHeader('Content-Type', metadata.contentType || 'image/jpeg');
                            res.setHeader('Cache-Control', 'public, max-age=86400');

                            // Stream the file
                            file.createReadStream()
                                .on('error', (err) => {
                                    console.error(`[Proxy] Stream error for ${filename}:`, err.message);
                                    if (!res.headersSent) res.status(500).send('Stream error');
                                })
                                .pipe(res);
                            servedViaGcs = true;
                            return; // Enforce return to stop fallback
                        }
                    }
                }
            } catch (gcsError) {
                // IMPORTANT: If GCS fails (e.g. auth error, permission denied), Log WARN and Fallback to public Axios fetch
                console.warn(`[Proxy] GCS Native fetch failed (falling back to public URL): ${gcsError.message}`);
                // servedViaGcs remains false, falling through to axios
            }
        }

        if (!servedViaGcs) {
            // FALLBACK / PUBLIC URLS
            const response = await axios({
                url,
                method: 'GET',
                responseType: 'stream'
            });

            res.setHeader('Content-Type', response.headers['content-type']);
            response.data.pipe(res);
        }

    } catch (error) {
        // Only 404/500 if real fetch fails (and not just GCS auth error)
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

// Serve Frontend in Production
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static(path.join(__dirname, '../frontend/dist')));

    // Handle React routing, return all requests to React app
    app.get('*', (req, res) => {
        // Check if the request is for an API endpoint
        if (req.path.startsWith('/api')) {
            return res.status(404).json({ message: 'API endpoint not found' });
        }

        const indexFile = path.resolve(__dirname, '../frontend/dist', 'index.html');

        // Debugging: Log path checks
        // console.log(`[Static] Checking for frontend build at: ${indexFile}`);

        if (fs.existsSync(indexFile)) {
            res.sendFile(indexFile);
        } else {
            console.error('[Static] index.html not found:', indexFile);

            // Recursive directory listing to debug where the files actually are
            try {
                const frontendPath = path.resolve(__dirname, '../frontend');
                console.log(`[Diagnostic] Listing ${frontendPath}:`, fs.readdirSync(frontendPath));
                const distPath = path.resolve(__dirname, '../frontend/dist');
                if (fs.existsSync(distPath)) {
                    console.log(`[Diagnostic] Listing ${distPath}:`, fs.readdirSync(distPath));
                } else {
                    console.log(`[Diagnostic] ${distPath} does not exist.`);
                }
            } catch (e) {
                console.error('[Diagnostic] Error listing dirs:', e.message);
            }

            res.status(500).send('Application Error: Frontend build missing. Check logs.');
        }
    });
} else {
    // Basic Route for Dev
    app.get('/', (req, res) => {
        res.send('MEWS API is running...');
    });
}

const PORT = process.env.PORT || 8080;

const startServer = async () => {
    // Log Environment Checks
    console.log('--- Server Startup Checks ---');
    console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`PORT: ${PORT}`);
    console.log(`MONGO_URI Provided: ${!!process.env.MONGO_URI}`);
    console.log(`GCS_CREDENTIALS Provided: ${!!process.env.GCS_CREDENTIALS}`);
    console.log('-----------------------------');

    try {
        await app.listen(PORT, '0.0.0.0');
        console.log(`Server running on port ${PORT}`);
    } catch (err) {
        console.error('Failed to bind to port:', err);
        process.exit(1);
    }
};

startServer();
