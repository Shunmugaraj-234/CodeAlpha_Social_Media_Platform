const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true },
  profileImage: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80' },
  coverImage: { type: String, default: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80' },
  bio: { type: String, default: 'Passionate about sharing ideas and connecting with curious minds.' },
  interests: [{ type: String, trim: true }],
  followersCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  pulseScore: { type: Number, default: 150 },
  scoreBreakdown: {
    posts: { type: Number, default: 40 },
    discussion: { type: Number, default: 50 },
    community: { type: Number, default: 30 },
    challenges: { type: Number, default: 20 },
    connections: { type: Number, default: 10 }
  },
  badges: [{
    id: String,
    title: String,
    icon: String,
    unlockedAt: { type: Date, default: Date.now }
  }],
  joinedCommunities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Community' }],
  joinedChallenges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' }],
  streakDays: { type: Number, default: 3 }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
