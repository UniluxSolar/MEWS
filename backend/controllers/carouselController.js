const CarouselImage = require('../models/CarouselImage');
const ActivityLog = require('../models/ActivityLog');
const fs = require('fs');
const path = require('path');

// Helper to Create Log
const createLog = async (req, action, details) => {
    try {
        await ActivityLog.create({
            user: req.user._id,
            action,
            module: 'CAROUSEL',
            details,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
    } catch (error) {
        console.error('Logging failed:', error);
    }
};

// @desc    Get all active public carousel images
// @route   GET /api/carousel/public
// @access  Public
const getPublicCarouselImages = async (req, res) => {
    console.log('[Controller] getPublicCarouselImages called');
    try {
        const images = await CarouselImage.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
        res.json(images);
    } catch (error) {
        console.error('Error fetching public carousel images:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all carousel images (Admin)
// @route   GET /api/carousel/all
// @access  Private (Super Admin)
const getAllCarouselImages = async (req, res) => {
    try {
        const images = await CarouselImage.find({}).sort({ order: 1, createdAt: -1 });
        res.json(images);
    } catch (error) {
        console.error('Error fetching all carousel images:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Upload new carousel image
// @route   POST /api/carousel
// @access  Private (Super Admin)
const uploadCarouselImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded' });
        }

        const { title, description, order, isActive } = req.body;

        // Construct image URL (assuming local storage for now based on other controllers, or simple relative path)
        // If uploadMiddleware saves to 'uploads/', then URL is 'uploads/filename'
        const imageUrl = `uploads/${req.file.filename}`;

        const newImage = await CarouselImage.create({
            title,
            description,
            imageUrl,
            order: order ? parseInt(order) : 0,
            isActive: isActive === 'true' || isActive === true,
            uploadedBy: req.user._id
        });

        await createLog(req, 'CREATE', `Uploaded new image: ${title || 'Untitled'} (${newImage._id})`);

        res.status(201).json(newImage);
    } catch (error) {
        console.error('Error uploading carousel image:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update carousel image details (Order, Active, Text)
// @route   PUT /api/carousel/:id
// @access  Private (Super Admin)
const updateCarouselImage = async (req, res) => {
    try {
        const image = await CarouselImage.findById(req.params.id);

        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }

        const { title, description, order, isActive } = req.body;

        if (title !== undefined) image.title = title;
        if (description !== undefined) image.description = description;
        if (order !== undefined) image.order = parseInt(order);
        if (isActive !== undefined) image.isActive = isActive;

        const updatedImage = await image.save();

        await createLog(req, 'UPDATE', `Updated image details: ${updatedImage.title || updatedImage._id}`);

        res.json(updatedImage);
    } catch (error) {
        console.error('Error updating carousel image:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete carousel image
// @route   DELETE /api/carousel/:id
// @access  Private (Super Admin)
const deleteCarouselImage = async (req, res) => {
    try {
        const image = await CarouselImage.findById(req.params.id);

        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }

        // Delete file from filesystem if it exists
        if (image.imageUrl && !image.imageUrl.startsWith('http')) {
            const filePath = path.join(__dirname, '../', image.imageUrl);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await CarouselImage.findByIdAndDelete(req.params.id);

        await createLog(req, 'DELETE', `Deleted image: ${image.title || image._id}`);

        res.json({ message: 'Image removed' });
    } catch (error) {
        console.error('Error deleting carousel image:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Bulk Update Status (Publish/Unpublish)
// @route   PUT /api/carousel/bulk-update
// @access  Private (Super Admin)
const bulkUpdateStatus = async (req, res) => {
    try {
        const { ids, isActive } = req.body; // ids: array of strings, isActive: boolean

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'No images selected' });
        }

        const result = await CarouselImage.updateMany(
            { _id: { $in: ids } },
            { $set: { isActive: isActive } }
        );

        const action = isActive ? 'PUBLISH' : 'UNPUBLISH';
        await createLog(req, action, `Bulk ${action.toLowerCase()}ed ${result.modifiedCount} images.`);

        res.json({ message: `Successfully updated ${result.modifiedCount} images`, result });
    } catch (error) {
        console.error('Error bulk updating carousel:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Bulk Delete
// @route   POST /api/carousel/bulk-delete
// @access  Private (Super Admin)
const bulkDelete = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'No images selected' });
        }

        // Find images first to delete files
        const imagesToDelete = await CarouselImage.find({ _id: { $in: ids } });

        for (const image of imagesToDelete) {
            if (image.imageUrl && !image.imageUrl.startsWith('http')) {
                const filePath = path.join(__dirname, '../', image.imageUrl);
                try {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                } catch (err) {
                    console.error(`Failed to delete file for image ${image._id}`, err);
                }
            }
        }

        const result = await CarouselImage.deleteMany({ _id: { $in: ids } });

        await createLog(req, 'DELETE', `Bulk deleted ${result.deletedCount} images.`);

        res.json({ message: `Successfully deleted ${result.deletedCount} images`, result });
    } catch (error) {
        console.error('Error bulk deleting carousel:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getPublicCarouselImages,
    getAllCarouselImages,
    uploadCarouselImage,
    updateCarouselImage,
    deleteCarouselImage,
    bulkUpdateStatus,
    bulkDelete
};
