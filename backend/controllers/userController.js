const User = require('../models/User');
const Follow = require('../models/Follow');
const Post = require('../models/Post');
const { calculateAndUpdatePulseScore } = require('../utils/pulseScore');

const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    let user;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(id).select('-password');
    } else {
      user = await User.findOne({ username: id.toLowerCase() }).select('-password');
    }

    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    // Recalculate Pulse score
    await calculateAndUpdatePulseScore(user._id);
    const updatedUser = await User.findById(user._id).select('-password');

    // Check completion percentage
    let completion = 40; // Base: username, email, name, pwd
    if (updatedUser.profileImage && !updatedUser.profileImage.includes('default')) completion += 15;
    if (updatedUser.coverImage) completion += 15;
    if (updatedUser.bio && updatedUser.bio.length > 10) completion += 15;
    if (updatedUser.interests && updatedUser.interests.length >= 3) completion += 15;

    // Check if current logged-in user is following this user
    let isFollowing = false;
    if (req.user) {
      const follow = await Follow.findOne({ follower: req.user._id, following: updatedUser._id });
      isFollowing = !!follow;
    }

    const postsCount = await Post.countDocuments({ author: updatedUser._id });

    res.json({
      ...updatedUser.toObject(),
      profileStrength: completion,
      isFollowing,
      postsCount
    });
  } catch (error) {
    console.error('getUserProfile error:', error);
    res.status(500).json({ message: 'Server error retrieving profile' });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { fullName, bio, profileImage, coverImage, interests } = req.body;

    if (fullName) user.fullName = fullName;
    if (bio !== undefined) user.bio = bio;
    if (profileImage) user.profileImage = profileImage;
    if (coverImage) user.coverImage = coverImage;
    if (interests) {
      user.interests = Array.isArray(interests) ? interests : interests.split(',').map(s => s.trim());
    }

    await user.save();
    await calculateAndUpdatePulseScore(user._id);

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

const getSuggestedPeople = async (req, res) => {
  try {
    const currentUserId = req.user ? req.user._id : null;
    const currentUserInterests = req.user ? req.user.interests.map(i => i.toLowerCase()) : ['ai/ml', 'programming', 'startups'];

    let filter = {};
    if (currentUserId) {
      const follows = await Follow.find({ follower: currentUserId });
      const followingIds = follows.map(f => f.following.toString());
      followingIds.push(currentUserId.toString());
      filter._id = { $nin: followingIds };
    }

    const candidates = await User.find(filter).select('-password').limit(15);

    const suggestions = candidates.map(candidate => {
      const candidateInterests = (candidate.interests || []).map(i => i.toLowerCase());
      
      // Calculate % match
      const shared = candidateInterests.filter(ci => currentUserInterests.includes(ci));
      const matchScore = currentUserInterests.length > 0 
        ? Math.min(98, Math.max(45, Math.round((shared.length / Math.max(1, currentUserInterests.length)) * 100) + 40))
        : 65;

      let reason = 'Popular in community';
      if (shared.length > 0) {
        reason = `Because you like ${shared[0].toUpperCase()}`;
      } else if (candidate.pulseScore > 600) {
        reason = 'High Pulse Creator';
      }

      return {
        _id: candidate._id,
        fullName: candidate.fullName,
        username: candidate.username,
        profileImage: candidate.profileImage,
        bio: candidate.bio,
        pulseScore: candidate.pulseScore,
        interests: candidate.interests,
        matchPercentage: matchScore,
        recommendationReason: reason
      };
    });

    suggestions.sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.json(suggestions);
  } catch (error) {
    console.error('getSuggestedPeople error:', error);
    res.status(500).json({ message: 'Error fetching suggested people' });
  }
};

const getInterestMap = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const interests = user.interests || ['Technology', 'AI/ML', 'Programming'];
    
    // Generate nodes and links for visually plotting on Interest Map canvas/SVG
    const nodes = interests.map((name, index) => ({
      id: name,
      label: name,
      weight: Math.max(20, 45 - index * 5),
      size: Math.max(28, 55 - index * 6)
    }));

    const links = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      links.push({
        source: nodes[i].id,
        target: nodes[i + 1].id,
        strength: 0.8
      });
    }
    if (nodes.length > 2) {
      links.push({ source: nodes[0].id, target: nodes[nodes.length - 1].id, strength: 0.5 });
    }

    res.json({ userId: user._id, username: user.username, nodes, links });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving interest map' });
  }
};

module.exports = { getUserProfile, updateUserProfile, getSuggestedPeople, getInterestMap };
