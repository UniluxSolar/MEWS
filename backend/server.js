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
app.use(express.json()); // Body parser
app.use(express.urlencoded({ extended: true })); // Form data parser
app.use('/uploads', express.static('uploads')); // Serve uploaded files

// Basic Route
app.get('/', (req, res) => {
    res.send('MEWS API is running...');
});

// Define Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/locations', require('./routes/locationRoutes'));
app.use('/api/members', require('./routes/memberRoutes'));
app.use('/api/institutions', require('./routes/institutionRoutes'));
app.use('/api/sos', require('./routes/sosRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/locations', require('./routes/locationRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
