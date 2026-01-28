const mongoose = require('mongoose');

const connectDB = async (retries = 5) => {
    while (retries > 0) {
        try {
            mongoose.set('strictQuery', false);
            const conn = await mongoose.connect(process.env.MONGO_URI, {
                serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
            });

            console.log(`MongoDB Connected: ${conn.connection.host}`);
            return; // Success
        } catch (error) {
            console.error(`Error: ${error.message}`);
            retries -= 1;
            console.log(`[DB] Retrying connection in 5 seconds... (${retries} attempts left)`);
            await new Promise(res => setTimeout(res, 5000));
        }
    }
    console.error('[DB] Critical: Could not connect to MongoDB after multiple attempts.');
};

module.exports = connectDB;
