const Community = require('../models/Community');
const User = require('../models/User');
const { calculateAndUpdatePulseScore } = require('../utils/pulseScore');

const getCommunities = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    const communities = await Community.find(query).sort({ membersCount: -1 });

    let decorated = communities;
    if (req.user) {
      const user = await User.findById(req.user._id);
      const joinedSet = new Set((user.joinedCommunities || []).map(id => id.toString()));
      decorated = communities.map(c => {
        const obj = c.toObject();
        obj.isMember = joinedSet.has(obj._id.toString());
        return obj;
      });
    }

    res.json(decorated);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving communities' });
  }
};

const getCommunityById = async (req, res) => {
  try {
    const { id } = req.params;
    let community;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      community = await Community.findById(id).populate('creator', 'fullName username profileImage');
    } else {
      community = await Community.findOne({ slug: id.toLowerCase() }).populate('creator', 'fullName username profileImage');
    }

    if (!community) return res.status(404).json({ message: 'Community not found' });

    const obj = community.toObject();
    if (req.user) {
      const user = await User.findById(req.user._id);
      const joinedSet = new Set((user.joinedCommunities || []).map(mId => mId.toString()));
      obj.isMember = joinedSet.has(community._id.toString());
    }

    res.json(obj);
  } catch (error) {
    res.status(500).json({ message: 'Error loading community details' });
  }
};

const joinCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ message: 'Community not found' });

    const userIdStr = req.user._id.toString();
    if (community.members.some(m => m.toString() === userIdStr)) {
      return res.status(400).json({ message: 'Already a member of this community' });
    }

    community.members.push(req.user._id);
    community.membersCount += 1;
    await community.save();

    await User.findByIdAndUpdate(req.user._id, { $addToSet: { joinedCommunities: community._id } });
    await calculateAndUpdatePulseScore(req.user._id);

    res.json({ message: `Joined ${community.name}`, isMember: true, membersCount: community.membersCount });
  } catch (error) {
    res.status(500).json({ message: 'Error joining community' });
  }
};

const leaveCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ message: 'Community not found' });

    const userIdStr = req.user._id.toString();
    const idx = community.members.findIndex(m => m.toString() === userIdStr);

    if (idx > -1) {
      community.members.splice(idx, 1);
      community.membersCount = Math.max(0, community.membersCount - 1);
      await community.save();
    }

    await User.findByIdAndUpdate(req.user._id, { $pull: { joinedCommunities: community._id } });
    await calculateAndUpdatePulseScore(req.user._id);

    res.json({ message: `Left ${community.name}`, isMember: false, membersCount: community.membersCount });
  } catch (error) {
    res.status(500).json({ message: 'Error leaving community' });
  }
};

const createCommunity = async (req, res) => {
  try {
    const { name, description, category, banner, icon } = req.body;
    if (!name || !description || !category) {
      return res.status(400).json({ message: 'Name, description and category are required' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existing = await Community.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: 'A community with a similar name already exists' });
    }

    const community = await Community.create({
      name,
      slug,
      description,
      category,
      banner: banner || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80',
      icon: icon || '🚀',
      creator: req.user._id,
      members: [req.user._id],
      membersCount: 1
    });

    await User.findByIdAndUpdate(req.user._id, { $addToSet: { joinedCommunities: community._id } });
    await calculateAndUpdatePulseScore(req.user._id);

    res.status(201).json(community);
  } catch (error) {
    res.status(500).json({ message: 'Error creating community', error: error.message });
  }
};

module.exports = {
  getCommunities,
  getCommunityById,
  joinCommunity,
  leaveCommunity,
  createCommunity
};
