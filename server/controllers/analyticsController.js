const mongoose = require('mongoose');
const Url = require('../models/Url');
const Analytics = require('../models/Analytics');

// Helper to compile aggregated analytics data
const getAggregatedData = async (urlId) => {
  const urlObjectId = new mongoose.Types.ObjectId(urlId);

  // 1. Total click count & last visited (already on URL model, but verified here)
  const totalClicks = await Analytics.countDocuments({ urlId: urlObjectId });

  // 2. Browser breakdown
  const browserBreakdown = await Analytics.aggregate([
    { $match: { urlId: urlObjectId } },
    { $group: { _id: '$browser', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // 3. Device breakdown
  const deviceBreakdown = await Analytics.aggregate([
    { $match: { urlId: urlObjectId } },
    { $group: { _id: '$device', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // 4. OS breakdown
  const osBreakdown = await Analytics.aggregate([
    { $match: { urlId: urlObjectId } },
    { $group: { _id: '$os', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // 5. Referrer breakdown
  const referrerBreakdown = await Analytics.aggregate([
    { $match: { urlId: urlObjectId } },
    { $group: { _id: '$referrer', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // 6. Country breakdown
  const countryBreakdown = await Analytics.aggregate([
    { $match: { urlId: urlObjectId } },
    { $group: { _id: '$country', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // 7. Daily click trends chart (last 7 days or standard group-by-date)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const dailyTrends = await Analytics.aggregate([
    {
      $match: {
        urlId: urlObjectId,
        timestamp: { $gte: sevenDaysAgo },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
        },
        clicks: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Fill in missing days with 0 clicks so the chart looks continuous
  const trendsMap = new Map(dailyTrends.map(d => [d._id, d.clicks]));
  const filledTrends = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    filledTrends.push({
      date: dateStr,
      clicks: trendsMap.get(dateStr) || 0,
    });
  }

  // 8. Recent click log (last 10 clicks)
  const recentClicks = await Analytics.find({ urlId: urlObjectId })
    .sort({ timestamp: -1 })
    .limit(10);

  return {
    totalClicks,
    browserBreakdown: browserBreakdown.map(b => ({ name: b._id, value: b.count })),
    deviceBreakdown: deviceBreakdown.map(d => ({ name: d._id, value: d.count })),
    osBreakdown: osBreakdown.map(o => ({ name: o._id, value: o.count })),
    referrerBreakdown: referrerBreakdown.map(r => ({ name: r._id, value: r.count })),
    countryBreakdown: countryBreakdown.map(c => ({ name: c._id, value: c.count })),
    dailyTrends: filledTrends,
    recentClicks,
  };
};

// @desc    Get analytics for a specific URL ID
// @route   GET /api/analytics/:urlId
// @access  Private
const getUrlAnalytics = async (req, res, next) => {
  try {
    const { urlId } = req.params;

    // Verify URL ownership
    const url = await Url.findOne({ _id: urlId, userId: req.user._id });
    if (!url) {
      return res.status(404).json({
        success: false,
        error: 'URL not found or unauthorized',
      });
    }

    const aggregated = await getAggregatedData(urlId);

    return res.json({
      success: true,
      data: {
        url,
        analytics: aggregated,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public analytics for a shortened code
// @route   GET /api/analytics/public/:shortCode
// @access  Public
const getPublicAnalytics = async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    const url = await Url.findOne({
      $or: [{ shortCode }, { customAlias: shortCode }],
    });

    if (!url) {
      return res.status(404).json({
        success: false,
        error: 'URL not found',
      });
    }

    // Aggregate statistics
    const aggregated = await getAggregatedData(url._id);

    return res.json({
      success: true,
      data: {
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        createdAt: url.createdAt,
        status: url.status,
        analytics: {
          totalClicks: aggregated.totalClicks,
          browserBreakdown: aggregated.browserBreakdown,
          deviceBreakdown: aggregated.deviceBreakdown,
          dailyTrends: aggregated.dailyTrends,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUrlAnalytics, getPublicAnalytics };
