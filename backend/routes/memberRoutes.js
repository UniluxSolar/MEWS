const express = require('express');
const router = express.Router();
const { registerMember, getMembers, getMemberById, updateMemberStatus } = require('../controllers/memberController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', registerMember); // Public (for self-registration) or Protected? Let's keep public for now.
router.get('/', protect, authorize('SUPER_ADMIN', 'STATE_ADMIN', 'DISTRICT_ADMIN', 'MANDAL_ADMIN', 'VILLAGE_ADMIN'), getMembers);
router.get('/:id', protect, getMemberById);
router.put('/:id/status', protect, authorize('SUPER_ADMIN', 'STATE_ADMIN', 'DISTRICT_ADMIN', 'MANDAL_ADMIN', 'VILLAGE_ADMIN'), updateMemberStatus);

module.exports = router;
