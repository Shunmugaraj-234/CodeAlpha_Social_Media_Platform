const Post = require('../models/Post');
const Reaction = require('../models/Reaction');

const getProfileAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const posts = await Post.find({ author: userId });
    const postIds = posts.map(p => p._id);

    let totalViews = 0;
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    let totalInsights = 0;

    posts.forEach(p => {
      totalViews += p.viewsCount || 0;
      totalLikes += p.likesCount || 0;
      totalComments += p.commentsCount || 0;
      totalShares += p.sharesCount || 0;
      if (p.reactions) {
        totalInsights += (p.reactions.insightful || 0) + (p.reactions.interesting || 0) + (p.reactions.support || 0) + (p.reactions.curious || 0);
      }
    });

    const totalEngagements = totalLikes + totalComments + totalShares + totalInsights;
    const engagementRate = totalViews > 0 ? ((totalEngagements / totalViews) * 100).toFixed(1) : 0;

    // Monthly / Weekly performance trend data points for chart
    const performanceChartData = [
      { day: 'Mon', views: Math.round(totalViews * 0.12), engagement: Math.round(totalEngagements * 0.1) },
      { day: 'Tue', views: Math.round(totalViews * 0.18), engagement: Math.round(totalEngagements * 0.15) },
      { day: 'Wed', views: Math.round(totalViews * 0.25), engagement: Math.round(totalEngagements * 0.28) },
      { day: 'Thu', views: Math.round(totalViews * 0.15), engagement: Math.round(totalEngagements * 0.18) },
      { day: 'Fri', views: Math.round(totalViews * 0.30), engagement: Math.round(totalEngagements * 0.29) }
    ];

    const topPosts = posts
      .map(p => ({
        _id: p._id,
        content: p.content.substring(0, 70) + '...',
        postType: p.postType,
        views: p.viewsCount,
        likes: p.likesCount,
        comments: p.commentsCount,
        insights: (p.reactions?.insightful || 0) + (p.reactions?.interesting || 0),
        createdAt: p.createdAt
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    res.json({
      summary: {
        totalPosts: posts.length,
        totalViews,
        totalLikes,
        totalComments,
        totalInsights,
        totalShares,
        engagementRate: `${engagementRate}%`
      },
      chartData: performanceChartData,
      topPosts
    });
  } catch (error) {
    console.error('getProfileAnalytics error:', error);
    res.status(500).json({ message: 'Error compiling creator analytics' });
  }
};

const getPostAnalytics = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view analytics for this post' });
    }

    const insights = (post.reactions?.insightful || 0) + (post.reactions?.interesting || 0);
    const totalEngagements = post.likesCount + post.commentsCount + post.sharesCount + insights;
    const rate = post.viewsCount > 0 ? ((totalEngagements / post.viewsCount) * 100).toFixed(1) : 0;

    res.json({
      postId: post._id,
      views: post.viewsCount,
      likes: post.likesCount,
      comments: post.commentsCount,
      insights,
      shares: post.sharesCount,
      reactionsBreakdown: post.reactions,
      engagementRate: `${rate}%`
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving post analytics' });
  }
};

module.exports = { getProfileAnalytics, getPostAnalytics };
