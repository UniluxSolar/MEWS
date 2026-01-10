const express = require('express');
const router = express.Router();
const { registerInstitution, getInstitutions, getInstitutionById, updateInstitution, deleteInstitution } = require('../controllers/institutionController');

const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(registerInstitution)
    .get(protect, getInstitutions);

router.route('/:id')
    .get(protect, getInstitutionById)
    .put(protect, updateInstitution)
    .delete(protect, deleteInstitution);

module.exports = router;
