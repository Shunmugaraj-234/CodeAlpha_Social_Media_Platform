const Follow = require('../models/Follow');
const Post = require('../models/Post');

const rankSmartFeed = async (posts, user = null, mode = 'FOR YOU') => {
  let followedIds = [];
  if (user) {
    const follows = await Follow.find({ follower: user._id });
    followedIds = follows.map(f => f.following.toString());
  }

  const userInterests = (user && user.interests) ? user.interests.map(i => i.toLowerCase()) : [];

  const now = Date.now();

  const scoredPosts = posts.map(post => {
    let score = 0;
    const isFollowed = followedIds.includes(post.author._id ? post.author._id.toString() : post.author.toString());
    const postTopic = (post.topic || '').toLowerCase();
    const postTags = (post.hashtags || []).map(t => t.toLowerCase().replace('#', ''));

    // Recency score (decay over hours)
    const hoursOld = Math.max(0.1, (now - new Date(post.createdAt).getTime()) / (1000 * 60 * 60));
    const recencyScore = 100 / Math.pow(hoursOld + 2, 1.2);

    // Engagement score
    const totalReactions = (post.reactions?.insightful || 0) + 
                           (post.reactions?.interesting || 0) + 
                           (post.reactions?.support || 0) + 
                           (post.reactions?.curious || 0) + 
                           (post.reactions?.like || 0);

    const engagementScore = (post.likesCount * 3) + (totalReactions * 4) + (post.commentsCount * 5) + (post.viewsCount * 0.5);

    if (mode === 'FOLLOWING') {
      if (isFollowed) score += 500;
      score += recencyScore + engagementScore * 0.5;
    } else if (mode === 'TRENDING') {
      const velocity = engagementScore / Math.pow(hoursOld + 1, 1.5);
      score += velocity * 50 + recencyScore * 0.5;
    } else {
      // FOR YOU (Smart Feed)
      if (isFollowed) score += 200;

      // Interest alignment
      let interestMatch = false;
      if (userInterests.includes(postTopic)) {
        score += 150;
        interestMatch = true;
      }
      postTags.forEach(tag => {
        if (userInterests.includes(tag)) {
          score += 80;
          interestMatch = true;
        }
      });

      // Insightful / High quality boost
      if (post.isDiscussion) score += 100;

      score += recencyScore + engagementScore;
    }

    return {
      post,
      smartScore: Math.round(score)
    };
  });

  scoredPosts.sort((a, b) => b.smartScore - a.smartScore);
  return scoredPosts.map(sp => sp.post);
};

module.exports = { rankSmartFeed };
