import crypto from 'crypto';
import StudyInvite from '../models/StudyInvite.js';
import User from '../models/User.js';

const populateInvite = q => q
  .populate('sender', 'username displayName avatar canTeach')
  .populate('receiver', 'username displayName avatar canTeach');

export async function listInvites(req, res) {
  const invites = await populateInvite(StudyInvite.find({ receiver: req.user._id, status: 'pending' }).sort({ createdAt: -1 }));
  const sent = await populateInvite(StudyInvite.find({ sender: req.user._id, status: 'pending' }).sort({ createdAt: -1 }));
  const active = await populateInvite(StudyInvite.find({ status: 'accepted', $or: [{ sender: req.user._id }, { receiver: req.user._id }] }).sort({ updatedAt: -1 }).limit(10));
  res.json({ invites, sent, active, currentUserId: req.user._id });
}

export async function sendInvite(req, res) {
  const receiver = await User.findById(req.params.userId).select('username displayName friends');
  if (!receiver) return res.status(404).json({ message: 'User not found.' });
  if (receiver._id.equals(req.user._id)) return res.status(400).json({ message: 'You cannot invite yourself.' });
  if (!req.user.friends.some(id => id.equals(receiver._id))) return res.status(403).json({ message: 'Accept the friend request before starting a study session.' });

  const existing = await StudyInvite.findOne({ sender: req.user._id, receiver: receiver._id, status: 'pending' });
  if (existing) return res.status(409).json({ message: 'A study invitation is already pending.' });

  const invite = await StudyInvite.create({
    sender: req.user._id,
    receiver: receiver._id,
    topic: req.body.topic?.trim() || 'Skill learning session',
    roomId: crypto.randomBytes(10).toString('hex')
  });
  const populated = await populateInvite(StudyInvite.findById(invite._id));
  req.app.get('io').to(`user:${receiver._id}`).emit('study-invite', populated);
  res.status(201).json({ invite: populated });
}

export async function respondInvite(req, res) {
  const invite = await StudyInvite.findOne({ _id: req.params.inviteId, receiver: req.user._id, status: 'pending' });
  if (!invite) return res.status(404).json({ message: 'Study invitation not found.' });

  if (req.params.action === 'reject') {
    invite.status = 'rejected';
    await invite.save();
    req.app.get('io').to(`user:${invite.sender}`).emit('study-invite-updated', { inviteId: invite._id, status: 'rejected' });
    return res.json({ message: 'Study invitation declined.' });
  }

  if (req.params.action === 'accept') {
    const areFriends = req.user.friends.some(id => id.equals(invite.sender));
    if (!areFriends) return res.status(403).json({ message: 'You are no longer connected with this user.' });
    invite.status = 'accepted';
    await invite.save();
    req.app.get('io').to(`user:${invite.sender}`).emit('study-invite-updated', { inviteId: invite._id, status: 'accepted', roomId: invite.roomId });
    return res.json({ message: 'Study invitation accepted.', roomId: invite.roomId });
  }
  return res.status(400).json({ message: 'Invalid action.' });
}

export async function getRoom(req, res) {
  const invite = await StudyInvite.findOne({ roomId: req.params.roomId, status: 'accepted', $or: [{ sender: req.user._id }, { receiver: req.user._id }] })
    .populate('sender', 'username displayName avatar canTeach wantsToLearn')
    .populate('receiver', 'username displayName avatar canTeach wantsToLearn');
  if (!invite) return res.status(404).json({ message: 'Study room not found.' });
  const other = invite.sender._id.equals(req.user._id) ? invite.receiver : invite.sender;
  res.json({ room: { roomId: invite.roomId, topic: invite.topic, other } });
}
