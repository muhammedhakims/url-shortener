const QRCode = require('qrcode');
const Url = require('../models/Url');

// Custom CommonJS compatible unique code generator (6-character alphanumeric)
const generateShortCode = () => {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return code;
};

// Helper function to check if shortCode/alias is unique
const isCodeUnique = async (code) => {
  const existing = await Url.findOne({
    $or: [{ shortCode: code }, { customAlias: code }],
  });
  return !existing;
};

// @desc    Create a short URL
// @route   POST /api/url/create
// @access  Private
const createShortUrl = async (req, res, next) => {
  try {
    const { originalUrl, customAlias, expiresAt } = req.body;
    let code;

    // Check customAlias uniqueness
    if (customAlias) {
      const aliasExists = await Url.findOne({
        $or: [{ shortCode: customAlias }, { customAlias: customAlias }],
      });
      if (aliasExists) {
        return res.status(400).json({
          success: false,
          error: 'Custom alias is already in use. Please select another.',
        });
      }
      code = customAlias;
    } else {
      // Generate a unique 6-char short code
      let attempts = 0;
      do {
        code = generateShortCode();
        attempts++;
      } while (!(await isCodeUnique(code)) && attempts < 10);

      if (attempts >= 10) {
        return res.status(500).json({
          success: false,
          error: 'Failed to generate a unique short code. Please try again.',
        });
      }
    }

    // Set up expiry date if provided
    let expiry = null;
    if (expiresAt) {
      expiry = new Date(expiresAt);
    }

    const newUrl = await Url.create({
      originalUrl,
      shortCode: code,
      customAlias: customAlias || null,
      userId: req.user._id,
      expiresAt: expiry,
      status: 'active',
    });

    // Generate QR Code
    // Construct the fully-qualified short URL link to put in the QR code.
    // We can fetch the base URL from environment variables or headers
    const host = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const shortUrl = `${host}/${code}`;
    const qrCodeUrl = await QRCode.toDataURL(shortUrl);

    return res.status(201).json({
      success: true,
      data: {
        ...newUrl.toObject(),
        shortUrl,
        qrCodeUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all URLs created by the user
// @route   GET /api/url/my-urls
// @access  Private
const getMyUrls = async (req, res, next) => {
  try {
    const urls = await Url.find({ userId: req.user._id }).sort({ createdAt: -1 });

    // Inline expiry check and status updates
    const now = new Date();
    const updatedUrls = await Promise.all(
      urls.map(async (url) => {
        let changed = false;
        if (url.expiresAt && url.expiresAt <= now && url.status === 'active') {
          url.status = 'expired';
          changed = true;
        }

        if (changed) {
          await url.save();
        }

        const host = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
        const shortUrl = `${host}/${url.shortCode}`;
        
        return {
          ...url.toObject(),
          shortUrl,
        };
      })
    );

    return res.json({
      success: true,
      count: updatedUrls.length,
      data: updatedUrls,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get specific URL details
// @route   GET /api/url/:id
// @access  Private
const getUrlById = async (req, res, next) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, userId: req.user._id });

    if (!url) {
      return res.status(404).json({
        success: false,
        error: 'URL not found or unauthorized',
      });
    }

    // Dynamic expiry update
    const now = new Date();
    if (url.expiresAt && url.expiresAt <= now && url.status === 'active') {
      url.status = 'expired';
      await url.save();
    }

    const host = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const shortUrl = `${host}/${url.shortCode}`;
    const qrCodeUrl = await QRCode.toDataURL(shortUrl);

    return res.json({
      success: true,
      data: {
        ...url.toObject(),
        shortUrl,
        qrCodeUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a URL (e.g. originalUrl, status, expiry)
// @route   PUT /api/url/:id
// @access  Private
const updateUrl = async (req, res, next) => {
  try {
    const { originalUrl, expiresAt, status } = req.body;

    const url = await Url.findOne({ _id: req.params.id, userId: req.user._id });

    if (!url) {
      return res.status(404).json({
        success: false,
        error: 'URL not found or unauthorized',
      });
    }

    if (originalUrl) url.originalUrl = originalUrl;
    if (status) url.status = status;
    if (expiresAt !== undefined) {
      url.expiresAt = expiresAt ? new Date(expiresAt) : null;
      // If we are clearing or setting future date, re-activate if it was expired
      if (!expiresAt || new Date(expiresAt) > new Date()) {
        if (url.status === 'expired' && status !== 'expired') {
          url.status = 'active';
        }
      }
    }

    await url.save();

    const host = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const shortUrl = `${host}/${url.shortCode}`;
    const qrCodeUrl = await QRCode.toDataURL(shortUrl);

    return res.json({
      success: true,
      message: 'URL updated successfully',
      data: {
        ...url.toObject(),
        shortUrl,
        qrCodeUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a shortened URL and associated analytics
// @route   DELETE /api/url/:id
// @access  Private
const deleteUrl = async (req, res, next) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, userId: req.user._id });

    if (!url) {
      return res.status(404).json({
        success: false,
        error: 'URL not found or unauthorized',
      });
    }

    // Delete URL document
    await Url.deleteOne({ _id: url._id });

    // Also delete any analytics records for this URL
    const Analytics = require('../models/Analytics');
    await Analytics.deleteMany({ urlId: url._id });

    return res.json({
      success: true,
      message: 'URL and its analytics deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createShortUrl,
  getMyUrls,
  getUrlById,
  updateUrl,
  deleteUrl,
};
