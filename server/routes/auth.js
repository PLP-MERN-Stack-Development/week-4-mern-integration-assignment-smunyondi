// auth.js - Express routes for user authentication

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
  console.log('Register route hit:', req.body);
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email, password });
    await user.save();
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    console.log('Register error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  console.log('Login route hit:', req.body);
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Login failed: user not found');
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Login failed: password mismatch');
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    console.log('Login successful:', {
      id: user._id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin
    });
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (err) {
    console.log('Login error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
