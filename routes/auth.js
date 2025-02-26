const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Improved input validation middleware
const validateAuthInput = (req, res, next) => {
  const { email } = req.body;
  
  // Check for missing email
  if (!email) {
    console.warn('Auth attempt with missing email');
    return res.status(400).json({ msg: 'Email is required' });
  }

  // Detect JWT token format
  if (typeof email === 'string' && email.split('.').length === 3 && email.startsWith('ey')) {
    console.warn('Auth attempt using JWT as email');
    return res.status(400).json({ msg: 'Invalid authentication attempt' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.warn('Invalid email format:', { email });
    return res.status(400).json({ msg: 'Invalid email format' });
  }

  next();
};

// Register with validation
router.post('/register', validateAuthInput, async (req, res) => {
  console.log('Registration attempt:', { email: req.body.email });
  
  const { email, password } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const user = new User({ email, password: hashed });
    await user.save();
    
    console.log('User registered successfully:', { email: user.email, id: user._id });
    res.json({ msg: 'User registered' });
  } catch (err) {
    if (err.code === 11000) {
      console.warn('Registration failed - Duplicate email:', { email, error: err.message });
      return res.status(400).json({ msg: 'Email already exists' });
    }
    console.error('Registration error:', { 
      email, 
      error: err.message, 
      stack: err.stack 
    });
    res.status(500).json({ msg: 'Server error during registration' });
  }
});

// Login with validation
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if input is a JWT token
    if (email.split('.').length === 3) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Log success
    console.log('Login successful:', {
      email: user.email,
      id: user._id,
      tokenExpiry: '24h'
    });

    // Send response
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Add a verify token endpoint
router.post('/verify-token', async (req, res) => {
  const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ msg: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id).select('-password');
    
    if (!user) {
      return res.status(401).json({ msg: 'User not found' });
    }

    res.json({ valid: true, user });
  } catch (err) {
    console.warn('Token verification failed:', err.message);
    res.status(401).json({ msg: 'Invalid token' });
  }
});

module.exports = router;