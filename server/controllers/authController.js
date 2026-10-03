import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function tokenFor(user) { return jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' }); }

export async function register(req, res) {
  try {
    const { displayName, username, email, password } = req.body;
    if (!displayName || !username || !email || !password) return res.status(400).json({ message: 'All fields are required.' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });

    const cleanUsername = username.toLowerCase().trim();
    const exists = await User.findOne({ $or: [{ username: cleanUsername }, { email: email.toLowerCase().trim() }] });
    if (exists) return res.status(409).json({ message: exists.username === cleanUsername ? 'Username is already taken.' : 'Email is already registered.' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ displayName: displayName.trim(), username: cleanUsername, email: email.toLowerCase().trim(), passwordHash });
    res.status(201).json({ token: tokenFor(user), user });
  } catch (e) { res.status(500).json({ message: e.code === 11000 ? 'Username or email already exists.' : 'Registration failed.' }); }
}

export async function login(req, res) {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username?.toLowerCase().trim() }).select('+passwordHash');
    if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) return res.status(401).json({ message: 'Invalid username or password.' });
    res.json({ token: tokenFor(user), user });
  } catch { res.status(500).json({ message: 'Login failed.' }); }
}

export async function me(req, res) { res.json({ user: req.user }); }
