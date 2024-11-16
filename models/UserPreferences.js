const mongoose = require('mongoose');

const UserPreferencesSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  likedContent: [String], // Array of liked article/video IDs
  readingHistory: [{ articleId: String, timestamp: Date }], // Track what and when content was accessed
  engagement: { type: Number, default: 0 }, // Engagement score
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('UserPreferences', UserPreferencesSchema);
