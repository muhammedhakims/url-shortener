const UAParser = require('ua-parser-js');
const Url = require('../models/Url');
const Analytics = require('../models/Analytics');

// Mock country detection based on IP for clean analytics variation
const getMockCountry = (ip) => {
  if (ip === '127.0.0.1' || ip === '::1' || ip.includes('localhost')) {
    return 'Localhost';
  }
  
  const countries = ['United States', 'India', 'United Kingdom', 'Germany', 'Canada', 'Australia', 'France', 'Japan', 'Brazil', 'Singapore'];
  // Hash the IP string to select a country consistently
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    hash = ip.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % countries.length;
  return countries[index];
};

// @desc    Redirect short code/alias to original URL and record analytics
// @route   GET /:shortCode
// @access  Public
const handleRedirect = async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    // Find URL by shortCode or customAlias
    const url = await Url.findOne({
      $or: [{ shortCode }, { customAlias: shortCode }],
    });

    if (!url) {
      return res.status(404).send(`
        <html>
          <head>
            <title>Link Not Found - PulseLink</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #0b0f19; color: #f3f4f6; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
              .container { max-width: 500px; padding: 2rem; border: 1px solid #1f2937; background: rgba(17, 24, 39, 0.7); border-radius: 12px; backdrop-filter: blur(10px); }
              h1 { color: #f43f5e; margin-bottom: 1rem; font-size: 2rem; }
              p { color: #9ca3af; margin-bottom: 2rem; line-height: 1.5; }
              a { display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; text-decoration: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: bold; transition: opacity 0.2s; }
              a:hover { opacity: 0.9; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Link Not Found</h1>
              <p>The shortened link you are trying to access does not exist or has been deleted.</p>
              <a href="/">Go to PulseLink</a>
            </div>
          </body>
        </html>
      `);
    }

    // Check expiry
    const now = new Date();
    if (url.expiresAt && url.expiresAt <= now) {
      url.status = 'expired';
      await url.save();

      return res.status(410).send(`
        <html>
          <head>
            <title>Link Expired - PulseLink</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #0b0f19; color: #f3f4f6; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
              .container { max-width: 500px; padding: 2rem; border: 1px solid #1f2937; background: rgba(17, 24, 39, 0.7); border-radius: 12px; backdrop-filter: blur(10px); }
              h1 { color: #f59e0b; margin-bottom: 1rem; font-size: 2rem; }
              p { color: #9ca3af; margin-bottom: 2rem; line-height: 1.5; }
              a { display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; text-decoration: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: bold; transition: opacity 0.2s; }
              a:hover { opacity: 0.9; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Link Expired</h1>
              <p>This shortened link reached its expiry date and is no longer active.</p>
              <a href="/">Go to PulseLink</a>
            </div>
          </body>
        </html>
      `);
    }

    // Parse visitor user-agent
    const userAgent = req.headers['user-agent'] || '';
    const parser = new UAParser(userAgent);
    const uaResults = parser.getResult();

    const browserName = uaResults.browser.name || 'Unknown';
    const osName = uaResults.os.name || 'Unknown';
    const deviceType = uaResults.device.type === 'mobile' ? 'Mobile' : uaResults.device.type === 'tablet' ? 'Tablet' : 'Desktop';
    
    // Parse IP Address
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    if (ip.startsWith('::ffff:')) {
      ip = ip.replace('::ffff:', '');
    }

    // Parse Referrer
    const referrer = req.headers.referer || req.headers.referrer || 'Direct';

    // Mock country based on IP
    const country = getMockCountry(ip);

    // Save Analytics Record async
    Analytics.create({
      urlId: url._id,
      browser: browserName,
      device: deviceType,
      os: osName,
      ipAddress: ip,
      referrer,
      country,
    }).catch(err => console.error('Failed to create analytics:', err));

    // Update URL document clicks
    url.clicks += 1;
    url.lastVisited = new Date();
    await url.save();

    // Redirect to original URL
    return res.redirect(url.originalUrl);
  } catch (error) {
    next(error);
  }
};

module.exports = { handleRedirect };
