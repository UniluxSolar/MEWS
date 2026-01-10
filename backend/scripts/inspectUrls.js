const mongoose = require('mongoose');
const Member = require('../models/Member');

const MONGO_URI = 'mongodb+srv://uniluxsolar_db_user:r8wjvZ5WSpLgqUe9@cluster0.xkaqz3k.mongodb.net/mews?appName=Cluster0';

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

const inspect = async () => {
    await connectDB();
    const members = await Member.find({
        $or: [
            { photoUrl: { $regex: 'uploads' } },
            { photoUrl: { $regex: 'localhost' } },
            { aadhaarFront: { $exists: true, $ne: '' } } // Check other fields too
        ]
    }).limit(10);
    console.log('--- Sample URLs ---');
    members.forEach(m => {
        console.log(`ID: ${m._id}`);
        console.log(`Photo: ${m.photoUrl}`);
        if (m.aadhaarFront) console.log(`Aadhaar Front: ${m.aadhaarFront}`);
        console.log('-------------------');
    });
    process.exit();
};

inspect();
