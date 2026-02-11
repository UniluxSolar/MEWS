const mongoose = require('mongoose');

const CarouselImageSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    order: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    expiryDate: {
        type: Date,
        default: null // Optional: If set, banner auto-hides after this date
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming there's a User model for admins, or Member if admins are members
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('CarouselImage', CarouselImageSchema);
