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

// Proxy Endpoint for Images (Fixes CORS for html2canvas)
const axios = require('axios');
app.get('/api/proxy-image', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).send('URL is required');

    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        });

        res.set('Content-Type', response.headers['content-type']);
        response.data.pipe(res);
    } catch (error) {
        console.error('Proxy Error:', error.message);
        res.status(500).send('Failed to fetch image');
    }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
