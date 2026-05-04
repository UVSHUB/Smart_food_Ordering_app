const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { OAuth2Client } = require('google-auth-library');

// Web Client ID from Google Cloud Console
const client = new OAuth2Client(process.env.GOOGLE_WEB_CLIENT_ID);

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, isAdmin, phone } = req.body;

    if (!name || name.trim().length < 2) {
      res.status(400);
      throw new Error('Name must be at least 2 characters long');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      res.status(400);
      throw new Error('Please enter a valid email address');
    }

    if (!password || password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters long');
    }

    if (phone) {
      const phoneRegex = /^(0\d{9})$/;
      if (!phoneRegex.test(phone)) {
        res.status(400);
        throw new Error('Please enter a valid 10-digit Sri Lankan phone number starting with 0');
      }
    }


    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const user = await User.create({
      name,
      email,
      password,
      isAdmin: isAdmin === true ? true : false,
      phone: phone || '',
    });


    if (user) {
      res.status(201).json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        phone: user.phone,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Google Login
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      res.status(400);
      throw new Error('ID Token is required');
    }

    // Verify token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_WEB_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user exists with googleId
    let user = await User.findOne({ googleId });

    if (!user) {
      // Check if user exists with email but no googleId
      user = await User.findOne({ email });

      if (user) {
        // Link googleId to existing user
        user.googleId = googleId;
        await user.save();
      } else {
        // Create new user
        user = await User.create({
          name,
          email,
          googleId,
          isAdmin: false,
        });
      }
    }

    res.json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      picture: picture,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401);
    next(new Error('Invalid Google Token'));
  }
};

module.exports = { registerUser, loginUser, googleLogin };
