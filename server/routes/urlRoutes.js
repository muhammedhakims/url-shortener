const express = require('express');
const {
  createShortUrl,
  getMyUrls,
  getUrlById,
  updateUrl,
  deleteUrl,
} = require('../controllers/urlController');
const { protect } = require('../middleware/authMiddleware');
const {
  createUrlValidator,
  updateUrlValidator,
} = require('../validators/urlValidator');

const router = express.Router();

// Apply protect middleware to all routes below
router.use(protect);

router.post('/create', createUrlValidator, createShortUrl);
router.get('/my-urls', getMyUrls);
router.get('/:id', getUrlById);
router.put('/:id', updateUrlValidator, updateUrl);
router.delete('/:id', deleteUrl);

module.exports = router;
