const express = require('express');
const router = express.Router();
const { registerMember, getMembers, getMemberById, updateMemberStatus, updateMember } = require('../controllers/memberController');
const upload = require('../middleware/uploadMiddleware');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(upload.fields([
        { name: 'photo', maxCount: 1 },
        { name: 'aadhaarFront', maxCount: 1 },
        { name: 'aadhaarBack', maxCount: 1 },
        { name: 'communityCert', maxCount: 1 },
        { name: 'marriageCert', maxCount: 1 },
        { name: 'rationCardFile', maxCount: 1 },
        { name: 'voterIdFront', maxCount: 1 },
        { name: 'voterIdBack', maxCount: 1 },
        { name: 'bankPassbook', maxCount: 1 }
    ]), registerMember);
router.get('/', protect, getMembers);
router.get('/:id', protect, getMemberById);
router.put('/:id/status', protect, authorize('SUPER_ADMIN', 'STATE_ADMIN', 'DISTRICT_ADMIN', 'MANDAL_ADMIN', 'VILLAGE_ADMIN'), updateMemberStatus);
router.put('/:id', protect, authorize('SUPER_ADMIN', 'STATE_ADMIN', 'DISTRICT_ADMIN', 'MANDAL_ADMIN', 'VILLAGE_ADMIN'), updateMember); // General update

module.exports = router;
