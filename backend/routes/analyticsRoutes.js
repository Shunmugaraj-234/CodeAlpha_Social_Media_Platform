const express = require('express');
const router = express.Router();
const { getProfileAnalytics, getPostAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/profile', protect, getProfileAnalytics);
router.get('/posts/:id', protect, getPostAnalytics);

module.exports = router;
