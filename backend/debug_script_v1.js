const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const CarouselImage = require('./models/CarouselImage');

dotenv.config();

const debug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const user = await User.findOne({ email: 'uniluxsolar@gmail.com' });
        console.log('User found:', user ? { id: user._id, email: user.email, role: user.role } : 'Not found');

        const carouselCount = await CarouselImage.countDocuments();
        console.log('Carousel images count:', carouselCount);

        const images = await CarouselImage.find();
        console.log('First image (if any):', images[0]);

        process.exit(0);
    } catch (err) {
        console.error('Debug script failed:', err);
        process.exit(1);
    }
};

debug();
