const express = require('express');
const router = express.Router();
const { registerMember, getMembers, getMemberById, updateMemberStatus, updateMember, deleteMember, checkDuplicate, getMemberStats } = require('../controllers/memberController');
const upload = require('../middleware/uploadMiddleware');
const { protect, authorize } = require('../middleware/authMiddleware');


router.get('/stats', protect, getMemberStats);
router.post('/check-duplicate', protect, checkDuplicate);

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
        { name: 'bankPassbook', maxCount: 1 },
        // Family Member Files (Arrays)
        { name: 'familyMemberPhotos', maxCount: 20 },
        { name: 'familyMemberAadhaarFronts', maxCount: 20 },
        { name: 'familyMemberAadhaarBacks', maxCount: 20 },
        { name: 'familyMemberVoterIdFronts', maxCount: 20 },
        { name: 'familyMemberVoterIdBacks', maxCount: 20 }
    ]), protect, registerMember);
router.get('/', protect, getMembers);
router.get('/:id', protect, getMemberById);
router.put('/:id/status', protect, authorize('SUPER_ADMIN', 'STATE_ADMIN', 'DISTRICT_ADMIN', 'MANDAL_ADMIN', 'VILLAGE_ADMIN'), updateMemberStatus);
router.put('/:id', protect, authorize('SUPER_ADMIN', 'STATE_ADMIN', 'DISTRICT_ADMIN', 'MANDAL_ADMIN', 'VILLAGE_ADMIN'), upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'aadhaarFront', maxCount: 1 },
    { name: 'aadhaarBack', maxCount: 1 },
    { name: 'communityCert', maxCount: 1 },
    { name: 'marriageCert', maxCount: 1 },
    { name: 'rationCardFile', maxCount: 1 },
    { name: 'voterIdFront', maxCount: 1 },
    { name: 'voterIdBack', maxCount: 1 },
    { name: 'bankPassbook', maxCount: 1 },
    { name: 'familyMemberPhotos', maxCount: 20 },
    { name: 'familyMemberAadhaarFronts', maxCount: 20 },
    { name: 'familyMemberAadhaarBacks', maxCount: 20 },
    { name: 'familyMemberVoterIdFronts', maxCount: 20 },
    { name: 'familyMemberVoterIdBacks', maxCount: 20 }
]), updateMember);
router.delete('/:id', protect, authorize('SUPER_ADMIN', 'STATE_ADMIN', 'DISTRICT_ADMIN', 'MANDAL_ADMIN', 'VILLAGE_ADMIN'), deleteMember);

module.exports = router;
