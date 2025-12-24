const express = require('express');
const router = express.Router();
const { createSOS, getActiveSOS } = require('../controllers/sosController');

router.route('/')
    .post(createSOS)
    .get(getActiveSOS);

module.exports = router;
