const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  getPostById,
  deletePost,
  reactPost,
  votePoll,
  bookmarkPost,
  getSavedPosts
} = require('../controllers/postController');
const { addComment, getPostComments } = require('../controllers/commentController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { checkModeration } = require('../middleware/moderationMiddleware');

router.get('/saved', protect, getSavedPosts);
router.get('/', optionalAuth, getPosts);
router.post('/', protect, checkModeration, createPost);
router.get('/:id', optionalAuth, getPostById);
router.delete('/:id', protect, deletePost);

// Reactions & Interactions
router.post('/:id/like', protect, (req, res, next) => { req.body.type = 'like'; next(); }, reactPost);
router.delete('/:id/like', protect, (req, res, next) => { req.body.type = 'like'; next(); }, reactPost);
router.post('/:id/reaction', protect, reactPost);
router.post('/:id/poll/vote', protect, votePoll);
router.post('/:id/bookmark', protect, bookmarkPost);

// Comments under posts
router.post('/:id/comments', protect, checkModeration, addComment);
router.get('/:id/comments', optionalAuth, getPostComments);

module.exports = router;
