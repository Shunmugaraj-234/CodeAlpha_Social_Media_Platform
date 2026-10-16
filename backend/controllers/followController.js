const Follow = require('../models/Follow');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { calculateAndUpdatePulseScore } = require('../utils/pulseScore');

const followUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return res.status(404).json({ message: 'User to follow not found' });

    const existing = await Follow.findOne({ follower: currentUserId, following: targetUserId });
    if (existing) {
      return res.status(400).json({ message: 'You are already following this user' });
    }

    await Follow.create({ follower: currentUserId, following: targetUserId });

    // Update counters
    await User.findByIdAndUpdate(currentUserId, { $inc: { followingCount: 1 } });
    await User.findByIdAndUpdate(targetUserId, { $inc: { followersCount: 1 } });

    // Notification
    await Notification.create({
      recipient: targetUserId,
      sender: currentUserId,
      type: 'FOLLOW',
      message: `${req.user.fullName} started following you.`
    });

    await calculateAndUpdatePulseScore(targetUserId);
    await calculateAndUpdatePulseScore(currentUserId);

    res.json({ message: `You are now following ${targetUser.username}`, isFollowing: true });
  } catch (error) {
    res.status(500).json({ message: 'Error following user', error: error.message });
  }
};

const unfollowUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    const follow = await Follow.findOneAndDelete({ follower: currentUserId, following: targetUserId });
    if (!follow) {
      return res.status(400).json({ message: 'You are not following this user' });
    }

    await User.findByIdAndUpdate(currentUserId, { $inc: { followingCount: -1 } });
    await User.findByIdAndUpdate(targetUserId, { $inc: { followersCount: -1 } });

    await calculateAndUpdatePulseScore(targetUserId);
    await calculateAndUpdatePulseScore(currentUserId);

    res.json({ message: 'Unfollowed successfully', isFollowing: false });
  } catch (error) {
    res.status(500).json({ message: 'Error unfollowing user' });
  }
};

const getFollowers = async (req, res) => {
  try {
    const follows = await Follow.find({ following: req.params.id }).populate('follower', 'fullName username profileImage pulseScore bio');
    res.json(follows.map(f => f.follower));
  } catch (error) {
    res.status(500).json({ message: 'Error loading followers' });
  }
};

const getFollowing = async (req, res) => {
  try {
    const follows = await Follow.find({ follower: req.params.id }).populate('following', 'fullName username profileImage pulseScore bio');
    res.json(follows.map(f => f.following));
  } catch (error) {
    res.status(500).json({ message: 'Error loading following' });
  }
};

module.exports = { followUser, unfollowUser, getFollowers, getFollowing };
