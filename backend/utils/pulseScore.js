const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Follow = require('../models/Follow');
const Reaction = require('../models/Reaction');

const calculateAndUpdatePulseScore = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    // Fetch user metrics
    const posts = await Post.find({ author: userId });
    const comments = await Comment.find({ author: userId });
    const followersCount = user.followersCount || 0;
    const joinedCommunitiesCount = user.joinedCommunities ? user.joinedCommunities.length : 0;
    const joinedChallengesCount = user.joinedChallenges ? user.joinedChallenges.length : 0;

    // Reactions received on user's posts
    const postIds = posts.map(p => p._id);
    const reactionsReceived = await Reaction.find({ post: { $in: postIds } });
    const insightfulCount = reactionsReceived.filter(r => r.type === 'insightful' || r.type === 'interesting').length;

    // Calculate score component breakdowns
    const postsScore = posts.length * 15;
    const discussionScore = comments.length * 10 + (insightfulCount * 12);
    const communityScore = joinedCommunitiesCount * 25;
    const challengesScore = joinedChallengesCount * 30;
    const connectionsScore = followersCount * 20;

    const totalPulseScore = 100 + postsScore + discussionScore + communityScore + challengesScore + connectionsScore;

    // Badges evaluation
    const badges = [...user.badges];
    const existingBadgeIds = new Set(badges.map(b => b.id));

    const availableBadges = [
      { id: 'early_explorer', title: '🏆 Early Explorer', icon: '🏆', condition: true },
      { id: 'streak_7', title: '🔥 7 Day Streak', icon: '🔥', condition: user.streakDays >= 7 },
      { id: 'idea_creator', title: '💡 Idea Creator', icon: '💡', condition: posts.some(p => p.postType === 'idea') },
      { id: 'discussion_starter', title: '💬 Discussion Starter', icon: '💬', condition: posts.some(p => p.commentsCount >= 3) },
      { id: 'community_builder', title: '🌟 Community Builder', icon: '🌟', condition: joinedCommunitiesCount >= 2 },
      { id: 'rising_creator', title: '🚀 Rising Creator', icon: '🚀', condition: totalPulseScore >= 300 },
      { id: 'connector', title: '🤝 Connector', icon: '🤝', condition: followersCount >= 2 }
    ];

    availableBadges.forEach(b => {
      if (b.condition && !existingBadgeIds.has(b.id)) {
        badges.push({
          id: b.id,
          title: b.title,
          icon: b.icon,
          unlockedAt: new Date()
        });
      }
    });

    user.pulseScore = totalPulseScore;
    user.scoreBreakdown = {
      posts: postsScore,
      discussion: discussionScore,
      community: communityScore,
      challenges: challengesScore,
      connections: connectionsScore
    };
    user.badges = badges;

    await user.save();
    return user;
  } catch (err) {
    console.error('Error calculating Pulse score:', err);
    return null;
  }
};

module.exports = { calculateAndUpdatePulseScore };
