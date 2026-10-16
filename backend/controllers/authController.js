const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { calculateAndUpdatePulseScore } = require('../utils/pulseScore');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'pulse_super_secret_jwt_key_2026_community_platform', {
    expiresIn: '30d'
  });
};

const registerUser = async (req, res) => {
  try {
    const { fullName, username, email, password, confirmPassword, interests } = req.body;

    if (!fullName || !username || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Username or Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      interests: Array.isArray(interests) ? interests : (interests ? interests.split(',') : ['Technology']),
      badges: [{ id: 'early_explorer', title: '🏆 Early Explorer', icon: '🏆', unlockedAt: new Date() }]
    });

    await calculateAndUpdatePulseScore(user._id);

    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      interests: user.interests,
      profileImage: user.profileImage,
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ message: 'Please enter email/username and password' });
    }

    const user = await User.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase() },
        { username: emailOrUsername.toLowerCase() }
      ]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    await calculateAndUpdatePulseScore(user._id);
    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      interests: user.interests,
      profileImage: user.profileImage,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching user profile' });
  }
};

module.exports = { registerUser, loginUser, getMe };
