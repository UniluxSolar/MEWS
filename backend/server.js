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
app.use('/api/notifications', require('./routes/notificationRoutes'));

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
