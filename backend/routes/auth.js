import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import logger, { logAction } from '../config/logger.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @route   POST /api/auth/register
router.post('/register', [
  body('username').trim().isLength({ min: 3 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      logAction('warn', 'Registration failed - user exists', {
        action: 'REGISTER_USER_EXISTS',
        email
      });
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = await User.create({ username, email, password });
    const token = generateToken(user._id);

    logAction('info', 'User registered successfully', {
      action: 'USER_REGISTER_SUCCESS',
      userId: user._id,
      username: user.username,
      email: user.email
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    logger.error('Registration error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      logAction('warn', 'Login failed - user not found', {
        action: 'LOGIN_USER_NOT_FOUND',
        email
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logAction('warn', 'Login failed - invalid password', {
        action: 'LOGIN_INVALID_PASSWORD',
        userId: user._id,
        email
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    logAction('info', 'User logged in successfully', {
      action: 'USER_LOGIN_SUCCESS',
      userId: user._id,
      email: user.email
    });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    logger.error('Login error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({
    id: req.user._id,
    username: req.user.username,
    email: req.user.email,
    createdAt: req.user.createdAt
  });
});

export default router;
