import User from '../models/User.js';
import FriendRequest from '../models/FriendRequest.js';

export async function sendRequest(req, res) {
  const receiver = await User.findById(req.params.userId);
  if (!receiver) return res.status(404).json({ message: 'User not found.' });
  if (receiver._id.equals(req.user._id)) return res.status(400).json({ message: 'You cannot add yourself.' });
  if (req.user.friends.some(id => id.equals(receiver._id))) return res.status(400).json({ message: 'You are already friends.' });

  const existing = await FriendRequest.findOne({
    $or: [{ sender: req.user._id, receiver: receiver._id }, { sender: receiver._id, receiver: req.user._id }],
    status: 'pending'
  });
  if (existing) return res.status(409).json({ message: 'A friend request is already pending.' });

  const request = await FriendRequest.create({ sender: req.user._id, receiver: receiver._id });
  res.status(201).json({ request });
}

export async function listRequests(req, res) {
  const requests = await FriendRequest.find({ receiver: req.user._id, status: 'pending' }).populate('sender', 'username displayName avatar canTeach');
  res.json({ requests });
}

export async function status(req, res) {
  const other = req.params.userId;
  if (req.user.friends.some(id => id.toString() === other)) return res.json({ status: 'friends' });
  const sent = await FriendRequest.findOne({ sender: req.user._id, receiver: other, status: 'pending' });
  if (sent) return res.json({ status: 'pending-sent', requestId: sent._id });
  const received = await FriendRequest.findOne({ sender: other, receiver: req.user._id, status: 'pending' });
  if (received) return res.json({ status: 'pending-received', requestId: received._id });
  res.json({ status: 'none' });
}

export async function respond(req, res) {
  const request = await FriendRequest.findOne({ _id: req.params.requestId, receiver: req.user._id, status: 'pending' });
  if (!request) return res.status(404).json({ message: 'Friend request not found.' });

  if (req.params.action === 'accept') {
    request.status = 'accepted';
    await request.save();
    await User.findByIdAndUpdate(request.sender, { $addToSet: { friends: request.receiver } });
    await User.findByIdAndUpdate(request.receiver, { $addToSet: { friends: request.sender } });
    return res.json({ message: 'Friend request accepted.' });
  }
  if (req.params.action === 'reject') {
    request.status = 'rejected';
    await request.save();
    return res.json({ message: 'Friend request rejected.' });
  }
  res.status(400).json({ message: 'Invalid action.' });
}
