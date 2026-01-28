
const mongoose = require('mongoose');
require('dotenv').config();

const verifyConnection = async () => {
    console.log('[Test] Attempting to connect to MongoDB...');
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('[Test] SUCCESS: Connected to MongoDB!');
        console.log(`[Test] Host: ${mongoose.connection.host}`);
        process.exit(0);
    } catch (error) {
        console.error('[Test] FAILED: Could not connect to MongoDB.');
        console.error(`[Test] Error: ${error.message}`);
        process.exit(1);
    }
};

verifyConnection();
