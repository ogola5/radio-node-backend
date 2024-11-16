const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

// Route to get user preferences
router.get('/preferences/:userId', dataController.getUserPreferences);

// Route to test Twitter authentication
router.get('/test-twitter-auth', dataController.testTwitterAuthentication);

// Route to fetch Twitter trends
router.get('/twitter-trends', dataController.fetchTwitterTrends);

router.get('/twitters-trends', dataController.getTrendingTopics);

router.get('/live-reports', dataController.getLiveReports);

// Route to get a specific live report by ID
router.get('/live-reports/:id', dataController.getLiveReportById);
// Route to fetch general or category-specific news articles
router.get('/news', (req, res) => {
  const category = req.query.category;
  if (category) {
    dataController.getNews(req, res);
  } else {
    dataController.fetchNews(req, res);
  }
});

// Route to fetch health tips (web-scraped)
router.get('/health-tips', dataController.getHealthTips);

module.exports = router;
