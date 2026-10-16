const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, getSuggestedPeople, getInterestMap } = require('../controllers/userController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { followUser, unfollowUser, getFollowers, getFollowing } = require('../controllers/followController');

router.get('/suggestions', optionalAuth, getSuggestedPeople);
router.get('/:id/interest-map', getInterestMap);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);
router.get('/:id', optionalAuth, getUserProfile);
router.put('/:id', protect, updateUserProfile);
router.post('/:id/follow', protect, followUser);
router.delete('/:id/follow', protect, unfollowUser);

module.exports = router;
