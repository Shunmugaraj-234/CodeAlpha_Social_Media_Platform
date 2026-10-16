const express = require('express');
const router = express.Router();
const {
  getCommunities,
  getCommunityById,
  joinCommunity,
  leaveCommunity,
  createCommunity
} = require('../controllers/communityController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

router.get('/', optionalAuth, getCommunities);
router.post('/', protect, createCommunity);
router.get('/:id', optionalAuth, getCommunityById);
router.post('/:id/join', protect, joinCommunity);
router.delete('/:id/leave', protect, leaveCommunity);

module.exports = router;
