const express = require('express');
const fs = require('fs');
//const connectDB = require('./config/db');
const dataRoutes = require('./routes/dataRoutes');
const cors = require('cors');
require('dotenv').config();

const app = express();
const { TwitterApi } = require('twitter-api-v2'); // Import Twitter API library

// Initialize Twitter client with Bearer Token
const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN_KEY);

// Function to test Twitter API
const testTwitterApi = async () => {
  try {
    // Example Twitter API v2 request to get a tweet by ID
    const tweetId = '20'; // Replace with a valid tweet ID
    const response = await twitterClient.v2.get('tweets', { ids: tweetId });
    console.log('Twitter API response:', response);
  } catch (error) {
    console.error('Error fetching data from Twitter:', error);
  }
};

// Call the test function
testTwitterApi();
// Connect to MongoDB
//connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/data', dataRoutes);

module.exports = app;
