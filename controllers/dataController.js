const axios = require('axios');
require('dotenv').config();
// const Twitter = require('twitter');
const UserPreferences = require('../models/UserPreferences');
const cheerio = require('cheerio');
const { TwitterApi } = require('twitter-api-v2');
const fs = require('fs');
const path = require('path');

// Configure Twitter API client
// const twitterClient = new TwitterApi({
//   // consumer_key: process.env.TWITTER_CONSUMER_KEY,
// //   // consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
//   bearer_token: process.env.TWITTER_BEARER_TOKEN_KEY
// //   // access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
// //   // access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
// });
const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN_KEY);
console.log('Bearer Token:', process.env.TWITTER_BEARER_TOKEN_KEY);


// Test Twitter Authentication
exports.testTwitterAuthentication = async (req, res) => {
  try {
    const data = await twitterClient.get('account/verify_credentials.json');
    console.log('Authentication Successful:', data);
    res.status(200).json({ message: 'Twitter Authentication Successful', data });
  } catch (error) {
    console.error('Authentication Error:', error);
    res.status(500).json({ error: 'Twitter Authentication Failed', details: error });
  }
};


// Fetch Twitter Trends
let cachedTrends = null;
let cacheExpirationTime = 0;
exports.fetchTwitterTrends = async (req, res) => {
const currentTime = Date.now();
  if (cachedTrends && currentTime < cacheExpirationTime) {
    return res.status(200).json(cachedTrends);
  }

  try {
    const trends = await twitterClient.v2.get('trends/available', { id: 1 });
    cachedTrends = trends[0].trends;
    cacheExpirationTime = currentTime + 15 * 60 * 1000; // Cache for 15 minutes
    res.status(200).json(cachedTrends);
  } catch (error) {
    if (error.code === 429) {
      const resetTime = error.rateLimit.reset * 1000;
      const waitTime = resetTime - currentTime;
      console.log(`Rate limit exceeded. Waiting until reset at ${new Date(resetTime).toISOString()}`);
      setTimeout(() => fetchTwitterTrends(req, res), waitTime);
    } else {
      console.error('Error fetching Twitter trends:', error);
      res.status(500).json({ error: 'Error fetching Twitter trends' });
    }
  }
}

// Fetch User Preferences
exports.getUserPreferences = async (req, res) => {
  try {
    const userId = req.params.userId;
    const userPrefs = await UserPreferences.findOne({ userId });
    if (!userPrefs) {
      return res.status(404).json({ error: 'User preferences not found' });
    }
    res.status(200).json(userPrefs);
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({ error: 'Error fetching user preferences' });
  }
};


// Fetch News Articles
exports.fetchNews = async (req, res) => {
  try {
    const response = await axios.get(
      `https://newsapi.org/v2/top-headlines?country=us&apiKey=${process.env.NEWS_API_KEY}`
    );
    res.status(200).json(response.data.articles);
  } catch (error) {
    console.error('Error fetching general news articles:', error);
    res.status(500).json({ error: 'Error fetching general news articles' });
  }
};

// Fetch News with Category Parameter
exports.getNews = async (req, res) => {
  try {
    const category = req.query.category || 'general';
    const response = await axios.get(`https://newsapi.org/v2/top-headlines`, {
      params: {
        category,
        country: 'us',
        apiKey: process.env.NEWS_API_KEY
      }
    });
    res.status(200).json(response.data.articles);
  } catch (error) {
    console.error('Error fetching news with category:', error);
    res.status(500).json({ error: 'Error fetching news' });
  }
};

exports.getHealthTips = async (req, res) => {
  try {
    // Fetch page data from the WHO website
    const { data } = await axios.get('https://www.who.int/philippines/news/feature-stories/detail/20-health-tips-for-2020');
    
    // Load the page data into Cheerio for easier parsing if needed in the frontend
    const $ = cheerio.load(data);

    // Extract the main content without filtering specific elements (all relevant sections)
    const pageContent = $('body').html();  // Capture entire HTML of the body

    // Send the raw HTML content back as the response for AI to handle filtering
    res.status(200).json({ pageContent });
  } catch (error) {
    // Log and respond with error if fetching fails
    console.error('Error fetching health tips:', error);
    res.status(500).json({ error: 'Error fetching health tips' });
  }
};


// Define the controller function to get trending topics
exports.getTrendingTopics = (req, res) => {
  const filePath = path.join(__dirname, '../data/trending_topics.json');
  
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading JSON file:', err);
      return res.status(500).json({ error: 'Failed to load trending topics.' });
    }

    const trends = JSON.parse(data);
    res.json(trends.trending_topics);
  });
};

// // Path to the live reports data file
// const dataPath = path.join(__dirname, '../data/live_reports.json');

// // Function to read the data from the JSON file
// const readLiveReportsData = () => {
//   const rawData = fs.readFileSync(dataPath);
//   return JSON.parse(rawData);
// };

// Get all live reports
// Function to get all live reports (Asynchronous)
exports.getLiveReports = (req, res) => {
  const dataPath = path.join(__dirname, '../data/live_reports.json');
  
  fs.readFile(dataPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading JSON file:', err);
      return res.status(500).json({ error: 'Failed to load live reports.' });
    }

    const liveReports = JSON.parse(data);
    res.json(liveReports.live_reports);
  });
};

// Function to get a specific live report by ID (Asynchronous)
exports.getLiveReportById = (req, res) => {
  const { id } = req.params;
  const dataPath = path.join(__dirname, '../data/live_reports.json');

  fs.readFile(dataPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading JSON file:', err);
      return res.status(500).json({ error: 'Failed to load live report.' });
    }

    const liveReports = JSON.parse(data).live_reports;
    const report = liveReports.find(r => r.id === id);
    
    if (report) {
      res.status(200).json(report);
    } else {
      res.status(404).json({ message: "Report not found" });
    }
  });
};