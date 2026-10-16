const express = require('express');
const router = express.Router();
const { getChallenges, getChallengeById, participateChallenge } = require('../controllers/challengeController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

router.get('/', optionalAuth, getChallenges);
router.get('/:id', optionalAuth, getChallengeById);
router.post('/:id/participate', protect, participateChallenge);

module.exports = router;
