const Challenge = require('../models/Challenge');
const User = require('../models/User');
const Post = require('../models/Post');
const { calculateAndUpdatePulseScore } = require('../utils/pulseScore');

const getChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find().sort({ createdAt: -1 });

    let decorated = challenges;
    if (req.user) {
      const user = await User.findById(req.user._id);
      const joinedSet = new Set((user.joinedChallenges || []).map(id => id.toString()));
      decorated = challenges.map(ch => {
        const obj = ch.toObject();
        obj.isParticipating = joinedSet.has(obj._id.toString());
        return obj;
      });
    }

    res.json(decorated);
  } catch (error) {
    res.status(500).json({ message: 'Error loading challenges' });
  }
};

const getChallengeById = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('participants', 'fullName username profileImage pulseScore');

    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });

    // Fetch posts associated with this challenge hashtag
    const posts = await Post.find({
      $or: [
        { challenge: challenge._id },
        { hashtags: challenge.hashtag }
      ]
    }).populate('author', 'fullName username profileImage pulseScore')
      .sort({ createdAt: -1 });

    const obj = challenge.toObject();
    if (req.user) {
      const user = await User.findById(req.user._id);
      const joinedSet = new Set((user.joinedChallenges || []).map(id => id.toString()));
      obj.isParticipating = joinedSet.has(challenge._id.toString());
    }
    obj.posts = posts;

    res.json(obj);
  } catch (error) {
    res.status(500).json({ message: 'Error loading challenge details' });
  }
};

const participateChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });

    const userIdStr = req.user._id.toString();
    const isAlreadyIn = challenge.participants.some(p => p.toString() === userIdStr);

    if (isAlreadyIn) {
      // Leave challenge
      challenge.participants = challenge.participants.filter(p => p.toString() !== userIdStr);
      challenge.participantsCount = Math.max(0, challenge.participantsCount - 1);
      await challenge.save();

      await User.findByIdAndUpdate(req.user._id, { $pull: { joinedChallenges: challenge._id } });
      await calculateAndUpdatePulseScore(req.user._id);

      return res.json({ message: 'Left challenge', isParticipating: false, participantsCount: challenge.participantsCount });
    } else {
      // Join challenge
      challenge.participants.push(req.user._id);
      challenge.participantsCount += 1;
      await challenge.save();

      await User.findByIdAndUpdate(req.user._id, { $addToSet: { joinedChallenges: challenge._id } });
      await calculateAndUpdatePulseScore(req.user._id);

      return res.json({ message: `Joined challenge! Share your posts using ${challenge.hashtag}`, isParticipating: true, participantsCount: challenge.participantsCount });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error participating in challenge' });
  }
};

module.exports = { getChallenges, getChallengeById, participateChallenge };
