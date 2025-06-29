// backend/src/controller/userController.ts
import { RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { generateRandomEmoji } from '../services/avatarService';

export const register: RequestHandler = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'Missing fields' });
    return;
  }

  const existing = await User.findOne({ username });
  if (existing) {
    res.status(409).json({ error: 'Username taken' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const avatarEmoji = generateRandomEmoji();

  const user = new User({ username, passwordHash, avatarEmoji });
  await user.save();

  res.status(201).json({
    userId: user._id,
    username: user.username,
    avatarEmoji: user.avatarEmoji,
  });
};

export const getProfile: RequestHandler = async (req, res) => {
  const userId = req.params.id;
  const user = await User.findById(userId).select('username avatarEmoji');
  if (!user) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.json(user);
};