const express = require('express');
const {
  getUrlAnalytics,
  getPublicAnalytics,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/public/:shortCode', getPublicAnalytics);
router.get('/:urlId', protect, getUrlAnalytics);

module.exports = router;
