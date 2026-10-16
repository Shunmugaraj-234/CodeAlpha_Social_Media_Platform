const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const { calculateAndUpdatePulseScore } = require('../utils/pulseScore');

const addComment = async (req, res) => {
  try {
    const { content, parentComment } = req.body;
    const postId = req.params.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Comment content cannot be empty' });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = await Comment.create({
      post: postId,
      author: req.user._id,
      content,
      parentComment: parentComment || null
    });

    // Increment post comments count
    post.commentsCount += 1;
    // Activate Discussion Mode if post has >= 4 comments
    if (post.commentsCount >= 4) {
      post.isDiscussion = true;
    }
    await post.save();

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'fullName username profileImage pulseScore badges');

    // Create Notification for post author or parent comment author
    let notifyTarget = post.author;
    let notifyType = 'COMMENT';
    let msg = `${req.user.fullName} commented on your post.`;

    if (parentComment) {
      const parentObj = await Comment.findById(parentComment);
      if (parentObj) {
        notifyTarget = parentObj.author;
        notifyType = 'REPLY';
        msg = `${req.user.fullName} replied to your comment.`;
      }
    }

    if (notifyTarget.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: notifyTarget,
        sender: req.user._id,
        type: notifyType,
        message: msg,
        post: postId
      });
    }

    await calculateAndUpdatePulseScore(req.user._id);

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error('addComment error:', error);
    res.status(500).json({ message: 'Error adding comment' });
  }
};

const getPostComments = async (req, res) => {
  try {
    const postId = req.params.id;
    const { sort = 'top' } = req.query; // 'top', 'newest', 'discussed'

    let sortOptions = { createdAt: -1 };
    if (sort === 'top') sortOptions = { likesCount: -1, createdAt: -1 };
    else if (sort === 'newest') sortOptions = { createdAt: -1 };

    const allComments = await Comment.find({ post: postId })
      .populate('author', 'fullName username profileImage pulseScore badges')
      .sort(sortOptions);

    // Structure threaded comments (top-level and nested replies)
    const commentMap = new Map();
    const topLevelComments = [];

    allComments.forEach(c => {
      const obj = c.toObject();
      obj.replies = [];
      commentMap.set(obj._id.toString(), obj);
    });

    allComments.forEach(c => {
      const obj = commentMap.get(c._id.toString());
      if (c.parentComment) {
        const parent = commentMap.get(c.parentComment.toString());
        if (parent) {
          parent.replies.push(obj);
        } else {
          topLevelComments.push(obj);
        }
      } else {
        topLevelComments.push(obj);
      }
    });

    if (sort === 'discussed') {
      topLevelComments.sort((a, b) => b.replies.length - a.replies.length);
    }

    res.json({
      comments: topLevelComments,
      totalCount: allComments.length,
      isDiscussion: allComments.length >= 4
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving comments' });
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    const postId = comment.post;
    await Comment.findByIdAndDelete(req.params.id);
    
    // Decrement post comment count
    const post = await Post.findById(postId);
    if (post) {
      post.commentsCount = Math.max(0, post.commentsCount - 1);
      await post.save();
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting comment' });
  }
};

const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const userIdStr = req.user._id.toString();
    const index = comment.likes.findIndex(id => id.toString() === userIdStr);

    if (index > -1) {
      comment.likes.splice(index, 1);
      comment.likesCount = Math.max(0, comment.likesCount - 1);
    } else {
      comment.likes.push(req.user._id);
      comment.likesCount += 1;
    }

    await comment.save();
    res.json({ likesCount: comment.likesCount, isLiked: index === -1 });
  } catch (error) {
    res.status(500).json({ message: 'Error liking comment' });
  }
};

module.exports = { addComment, getPostComments, deleteComment, likeComment };
