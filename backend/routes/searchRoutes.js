const express = require('express');
const router = express.Router();
const { globalSearch, getHashtagDetails, getTrendingTopics } = require('../controllers/searchController');

router.get('/', globalSearch);
router.get('/trending', getTrendingTopics);
router.get('/hashtag/:tag', getHashtagDetails);

module.exports = router;
