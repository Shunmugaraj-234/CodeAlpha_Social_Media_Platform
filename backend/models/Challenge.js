const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  hashtag: { type: String, required: true },
  banner: { type: String, default: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80' },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  participantsCount: { type: Number, default: 0 },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  badgeReward: { type: String, default: '🏆 Challenge Champion' }
}, { timestamps: true });

module.exports = mongoose.model('Challenge', challengeSchema);
