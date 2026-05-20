const { check, validationResult } = require('express-validator');

// Middleware to check validation results
const validateResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

const createUrlValidator = [
  check('originalUrl', 'Please enter a valid URL (starting with http:// or https://)')
    .notEmpty()
    .isURL({ require_tld: true, require_protocol: true }),
  check('customAlias', 'Custom alias must be alphanumeric or contain dashes/underscores')
    .optional({ checkFalsy: true })
    .isAlphanumeric('en-US', { ignore: '-_' })
    .isLength({ min: 3, max: 30 })
    .withMessage('Alias must be between 3 and 30 characters'),
  check('expiresAt', 'Invalid expiry date')
    .optional({ checkFalsy: true })
    .isISO8601()
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Expiry date must be in the future');
      }
      return true;
    }),
  validateResults,
];

const updateUrlValidator = [
  check('originalUrl', 'Please enter a valid URL')
    .optional()
    .isURL({ require_tld: true, require_protocol: true }),
  check('expiresAt', 'Invalid expiry date')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (value && new Date(value) <= new Date()) {
        throw new Error('Expiry date must be in the future');
      }
      return true;
    }),
  validateResults,
];

module.exports = { createUrlValidator, updateUrlValidator };
