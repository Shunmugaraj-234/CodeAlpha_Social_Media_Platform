const Post = require('../models/Post');
const User = require('../models/User');
const Reaction = require('../models/Reaction');
const Bookmark = require('../models/Bookmark');
const Notification = require('../models/Notification');
const { rankSmartFeed } = require('../utils/smartFeed');
const { calculateAndUpdatePulseScore } = require('../utils/pulseScore');

const createPost = async (req, res) => {
  try {
    const { content, image, postType, mood, topic, hashtags, community, challenge, poll } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Post content cannot be empty' });
    }

    // Auto-extract hashtags if not passed
    let parsedHashtags = Array.isArray(hashtags) ? hashtags : [];
    if (!parsedHashtags.length) {
      const hashtagMatches = content.match(/#[a-zA-Z0-9_]+/g);
      if (hashtagMatches) parsedHashtags = hashtagMatches;
    }

    // Parse poll if postType === 'poll'
    let pollData = undefined;
    if (postType === 'poll' && poll && poll.question && Array.isArray(poll.options)) {
      pollData = {
        question: poll.question,
        options: poll.options.map(opt => ({
          optionText: typeof opt === 'string' ? opt : opt.optionText,
          votes: []
        }))
      };
    }

    const post = await Post.create({
      author: req.user._id,
      content,
      image: image || '',
      postType: postType || 'text',
      mood: mood || '',
      topic: topic || 'General',
      hashtags: parsedHashtags,
      community: community || null,
      challenge: challenge || null,
      poll: pollData
    });

    const populatedPost = await Post.findById(post._id).populate('author', 'fullName username profileImage pulseScore badges');

    // Update Pulse Score
    await calculateAndUpdatePulseScore(req.user._id);

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('createPost error:', error);
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
};

const getPosts = async (req, res) => {
  try {
    const { mode = 'FOR YOU', topic, community, user: filterUser, page = 1, limit = 10 } = req.query;

    let query = {};
    if (topic) query.topic = topic;
    if (community) query.community = community;
    if (filterUser) query.author = filterUser;

    const rawPosts = await Post.find(query)
      .populate('author', 'fullName username profileImage pulseScore badges')
      .populate('community', 'name slug icon')
      .sort({ createdAt: -1 })
      .limit(50);

    // Apply Smart Feed Algorithm
    const ranked = await rankSmartFeed(rawPosts, req.user, mode.toUpperCase().replace('-', ' '));

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const paginatedPosts = ranked.slice(startIndex, startIndex + parseInt(limit));

    // Decorate with user interaction flags (userReaction, isBookmarked)
    let decoratedPosts = paginatedPosts;
    if (req.user) {
      const userReactions = await Reaction.find({ user: req.user._id });
      const userBookmarks = await Bookmark.find({ user: req.user._id });
      const reactionMap = new Map(userReactions.map(r => [r.post.toString(), r.type]));
      const bookmarkSet = new Set(userBookmarks.map(b => b.post.toString()));

      decoratedPosts = paginatedPosts.map(p => {
        const obj = p.toObject ? p.toObject() : p;
        obj.userReaction = reactionMap.get(obj._id.toString()) || null;
        obj.isBookmarked = bookmarkSet.has(obj._id.toString());
        return obj;
      });
    }

    res.json({
      posts: decoratedPosts,
      totalCount: rawPosts.length,
      page: parseInt(page),
      hasMore: startIndex + parseInt(limit) < rawPosts.length
    });
  } catch (error) {
    console.error('getPosts error:', error);
    res.status(500).json({ message: 'Error loading posts' });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'fullName username profileImage pulseScore bio badges')
      .populate('community', 'name slug icon');

    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Increment view count asynchronously
    post.viewsCount = (post.viewsCount || 0) + 1;
    await post.save();

    const obj = post.toObject();
    if (req.user) {
      const existingReaction = await Reaction.findOne({ user: req.user._id, post: post._id });
      const isBookmarked = await Bookmark.findOne({ user: req.user._id, post: post._id });
      obj.userReaction = existingReaction ? existingReaction.type : null;
      obj.isBookmarked = !!isBookmarked;
    }

    res.json(obj);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving post' });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);
    await calculateAndUpdatePulseScore(req.user._id);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post' });
  }
};

const reactPost = async (req, res) => {
  try {
    const { type } = req.body; // 'insightful', 'interesting', 'like', 'support', 'curious'
    const allowed = ['insightful', 'interesting', 'like', 'support', 'curious'];
    
    if (!allowed.includes(type)) {
      return res.status(400).json({ message: 'Invalid reaction type' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    let existing = await Reaction.findOne({ user: req.user._id, post: post._id });

    if (existing) {
      if (existing.type === type) {
        // Toggle off
        await Reaction.findByIdAndDelete(existing._id);
        post.reactions[type] = Math.max(0, (post.reactions[type] || 1) - 1);
        if (type === 'like') post.likesCount = Math.max(0, post.likesCount - 1);
      } else {
        // Switch reaction type
        const prevType = existing.type;
        post.reactions[prevType] = Math.max(0, (post.reactions[prevType] || 1) - 1);
        if (prevType === 'like') post.likesCount = Math.max(0, post.likesCount - 1);

        existing.type = type;
        await existing.save();

        post.reactions[type] = (post.reactions[type] || 0) + 1;
        if (type === 'like') post.likesCount += 1;
      }
    } else {
      // New reaction
      await Reaction.create({ user: req.user._id, post: post._id, type });
      post.reactions[type] = (post.reactions[type] || 0) + 1;
      if (type === 'like') post.likesCount += 1;

      // Send real notification if not self-reaction
      if (post.author.toString() !== req.user._id.toString()) {
        const reactionLabels = {
          insightful: 'found your post insightful 💡',
          interesting: 'found your post interesting 🔥',
          like: 'liked your post ❤️',
          support: 'supported your post 👏',
          curious: 'is curious about your post 🤔'
        };

        await Notification.create({
          recipient: post.author,
          sender: req.user._id,
          type: type === 'insightful' ? 'INSIGHT' : 'LIKE',
          message: `${req.user.fullName} ${reactionLabels[type]}`,
          post: post._id
        });
      }
    }

    await post.save();
    await calculateAndUpdatePulseScore(post.author);

    res.json({
      reactions: post.reactions,
      likesCount: post.likesCount,
      userReaction: existing && existing.type === type ? null : type
    });
  } catch (error) {
    console.error('reactPost error:', error);
    res.status(500).json({ message: 'Error reacting to post' });
  }
};

const votePoll = async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post || post.postType !== 'poll' || !post.poll) {
      return res.status(400).json({ message: 'Invalid poll post' });
    }

    const userIdStr = req.user._id.toString();

    // Check if user already voted
    let alreadyVoted = false;
    post.poll.options.forEach(opt => {
      if (opt.votes.some(v => v.toString() === userIdStr)) {
        alreadyVoted = true;
      }
    });

    if (alreadyVoted) {
      return res.status(400).json({ message: 'You have already voted on this poll' });
    }

    if (optionIndex < 0 || optionIndex >= post.poll.options.length) {
      return res.status(400).json({ message: 'Invalid poll option selection' });
    }

    post.poll.options[optionIndex].votes.push(req.user._id);
    await post.save();

    res.json(post.poll);
  } catch (error) {
    res.status(500).json({ message: 'Error submitting poll vote' });
  }
};

const bookmarkPost = async (req, res) => {
  try {
    const { category = 'Others' } = req.body;
    const postId = req.params.id;

    const existing = await Bookmark.findOne({ user: req.user._id, post: postId });
    if (existing) {
      await Bookmark.findByIdAndDelete(existing._id);
      return res.json({ isBookmarked: false, message: 'Removed from bookmarks' });
    }

    await Bookmark.create({ user: req.user._id, post: postId, category });
    res.json({ isBookmarked: true, message: 'Saved to bookmarks' });
  } catch (error) {
    res.status(500).json({ message: 'Error bookmarking post' });
  }
};

const getSavedPosts = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user._id })
      .populate({
        path: 'post',
        populate: { path: 'author', select: 'fullName username profileImage pulseScore' }
      })
      .sort({ createdAt: -1 });

    res.json(bookmarks.filter(b => b.post !== null));
  } catch (error) {
    res.status(500).json({ message: 'Error loading saved posts' });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  deletePost,
  reactPost,
  votePoll,
  bookmarkPost,
  getSavedPosts
};
