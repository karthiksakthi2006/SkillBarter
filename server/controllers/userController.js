import User from '../models/User.js';

const publicFields = 'username displayName email bio avatar location canTeach wantsToLearn availability languages profileViews friends createdAt';

export async function searchUsers(req, res) {
  const q = (req.query.q || '').trim();
  const filter = q ? { $and: [
    { _id: { $ne: req.user._id } },
    { $or: [
      { username: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
      { displayName: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
      { 'canTeach.skill': { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
      { wantsToLearn: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }
    ]}
  ]} : { _id: { $ne: req.user._id } };

  const users = await User.find(filter).select(publicFields).limit(50).sort({ createdAt: -1 });
  res.json({ users });
}

export async function getProfile(req, res) {
  const user = await User.findOne({ username: req.params.username.toLowerCase() }).select(publicFields);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  if (req.user._id.toString() !== user._id.toString()) await User.findByIdAndUpdate(user._id, { $inc: { profileViews: 1 } });
  res.json({ user });
}

export async function updateMe(req, res) {
  const allowed = ['bio', 'location', 'canTeach', 'wantsToLearn', 'availability', 'languages', 'avatar'];
  for (const key of allowed) if (key in req.body) req.user[key] = req.body[key];
  await req.user.save();
  res.json({ user: req.user });
}
