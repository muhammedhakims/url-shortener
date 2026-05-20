const express = require('express');
const { handleRedirect } = require('../controllers/redirectController');

const router = express.Router();

router.get('/:shortCode', handleRedirect);

module.exports = router;
