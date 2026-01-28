const express = require('express');
const router = express.Router();
const {
    getPublicCarouselImages,
    getAllCarouselImages,
    uploadCarouselImage,
    updateCarouselImage,
    deleteCarouselImage,
    bulkUpdateStatus,
    bulkDelete
} = require('../controllers/carouselController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Reusing existing upload middleware

// Public route
router.get('/public', getPublicCarouselImages);

// Admin routes (Protected + Super Admin only)
router.get('/all', protect, authorize('SUPER_ADMIN'), getAllCarouselImages);

// Bulk Operations (MUST come before /:id routes to avoid collision if strict matching issues, but /bulk-update is unique enough)
router.put('/bulk-update', protect, authorize('SUPER_ADMIN'), bulkUpdateStatus);
router.post('/bulk-delete', protect, authorize('SUPER_ADMIN'), bulkDelete);

router.post('/', protect, authorize('SUPER_ADMIN'), upload.single('image'), uploadCarouselImage);
router.put('/:id', protect, authorize('SUPER_ADMIN'), updateCarouselImage);
router.delete('/:id', protect, authorize('SUPER_ADMIN'), deleteCarouselImage);

module.exports = router;
