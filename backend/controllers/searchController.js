const User = require('../models/User');
const Post = require('../models/Post');
const Community = require('../models/Community');

const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.json({ users: [], posts: [], communities: [], hashtags: [] });
    }

    const queryRegex = new RegExp(q.trim(), 'i');

    const users = await User.find({
      $or: [{ fullName: queryRegex }, { username: queryRegex }, { bio: queryRegex }]
    }).select('-password').limit(10);

    const posts = await Post.find({
      $or: [{ content: queryRegex }, { topic: queryRegex }, { hashtags: queryRegex }]
    }).populate('author', 'fullName username profileImage pulseScore')
      .populate('community', 'name slug icon')
      .sort({ createdAt: -1 })
      .limit(10);

    const communities = await Community.find({
      $or: [{ name: queryRegex }, { description: queryRegex }, { category: queryRegex }]
    }).limit(10);

    // Hashtag extraction
    const allPosts = await Post.find({ hashtags: { $exists: true, $ne: [] } });
    const tagMap = new Map();
    allPosts.forEach(p => {
      p.hashtags.forEach(tag => {
        const clean = tag.startsWith('#') ? tag : `#${tag}`;
        if (clean.toLowerCase().includes(q.toLowerCase())) {
          tagMap.set(clean, (tagMap.get(clean) || 0) + 1);
        }
      });
    });

    const hashtags = Array.from(tagMap.entries()).map(([tag, count]) => ({
      name: tag,
      count,
      growth: '+42% this week'
    })).sort((a, b) => b.count - a.count).slice(0, 10);

    res.json({ users, posts, communities, hashtags });
  } catch (error) {
    console.error('globalSearch error:', error);
    res.status(500).json({ message: 'Error performing search' });
  }
};

const getHashtagDetails = async (req, res) => {
  try {
    let tag = req.params.tag;
    if (!tag.startsWith('#')) tag = `#${tag}`;

    const posts = await Post.find({ hashtags: { $in: [tag, tag.replace('#', '')] } })
      .populate('author', 'fullName username profileImage pulseScore')
      .populate('community', 'name slug icon')
      .sort({ createdAt: -1 });

    // Extract unique authors
    const authorMap = new Map();
    posts.forEach(p => {
      if (p.author) authorMap.set(p.author._id.toString(), p.author);
    });

    const popularUsers = Array.from(authorMap.values()).slice(0, 5);

    res.json({
      tag,
      postsCount: posts.length,
      growthPercentage: '+42% this week',
      participantsCount: popularUsers.length,
      trendingPosts: posts,
      popularUsers,
      relatedHashtags: ['#ArtificialIntelligence', '#MachineLearning', '#Tech2026', '#Innovation']
    });
  } catch (error) {
    res.status(500).json({ message: 'Error loading hashtag details' });
  }
};

const getTrendingTopics = async (req, res) => {
  try {
    const posts = await Post.find({ hashtags: { $exists: true, $ne: [] } });
    const tagMap = new Map();

    posts.forEach(p => {
      (p.hashtags || []).forEach(tag => {
        const formatted = tag.startsWith('#') ? tag : `#${tag}`;
        const prev = tagMap.get(formatted) || { name: formatted, count: 0, growth: '+35%' };
        prev.count += 1;
        tagMap.set(formatted, prev);
      });
    });

    // Default trends if data is small
    const defaultTrends = [
      { name: '#ArtificialIntelligence', count: 1240, growth: '+42% this week', postsCount: 1240 },
      { name: '#WebDevelopment', count: 980, growth: '+28% this week', postsCount: 980 },
      { name: '#Startups', count: 850, growth: '+51% this week', postsCount: 850 },
      { name: '#7DaysOfCoding', count: 620, growth: '+64% this week', postsCount: 620 },
      { name: '#Cybersecurity', count: 410, growth: '+19% this week', postsCount: 410 }
    ];

    const dynamicTrends = Array.from(tagMap.values())
      .map(t => ({ ...t, growth: `+${Math.floor(Math.random() * 40 + 20)}% this week`, postsCount: t.count }))
      .sort((a, b) => b.count - a.count);

    const merged = dynamicTrends.length >= 3 ? dynamicTrends : defaultTrends;

    res.json(merged);
  } catch (error) {
    res.status(500).json({ message: 'Error loading trending topics' });
  }
};

module.exports = { globalSearch, getHashtagDetails, getTrendingTopics };
