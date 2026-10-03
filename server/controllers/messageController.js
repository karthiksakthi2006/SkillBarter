import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

function pair(a,b) { return [a.toString(), b.toString()].sort(); }

export async function listConversations(req,res) {
  const conversations = await Conversation.find({ participants: req.user._id })
    .populate('participants', 'username displayName avatar canTeach')
    .populate({ path:'lastMessage', populate:{ path:'sender', select:'username displayName' } })
    .sort({ updatedAt:-1 });

  const result = conversations.map(c => ({
    ...c.toObject(),
    participant: c.participants.find(p => !p._id.equals(req.user._id)),
    currentUserId: req.user._id
  }));
  res.json({ conversations: result });
}

export async function getOrCreateConversation(req,res) {
  const other = await User.findById(req.params.userId).select('username displayName avatar canTeach friends');
  if (!other) return res.status(404).json({message:'User not found.'});
  if (!req.user.friends.some(id => id.equals(other._id))) return res.status(403).json({message:'You can message only accepted friends.'});

  const ids = pair(req.user._id, other._id);
  let c = await Conversation.findOne({ participants: { $all: ids, $size: 2 } }).populate('participants','username displayName avatar canTeach');
  if (!c) c = await Conversation.create({ participants: ids }), c = await c.populate('participants','username displayName avatar canTeach');
  const messages = await Message.find({ conversation:c._id }).populate('sender','username displayName').sort({createdAt:1});
  res.json({ conversation:{ ...c.toObject(), participant:c.participants.find(p=>!p._id.equals(req.user._id)), messages, currentUserId:req.user._id } });
}

export async function sendMessage(req,res) {
  const { conversationId, text } = req.body;
  if (!text?.trim()) return res.status(400).json({message:'Message cannot be empty.'});
  const c = await Conversation.findOne({ _id:conversationId, participants:req.user._id }).populate('participants','username displayName');
  if (!c) return res.status(404).json({message:'Conversation not found.'});
  const msg = await Message.create({ conversation:c._id, sender:req.user._id, text:text.trim() });
  const message = await msg.populate('sender','username displayName');
  c.lastMessage = msg._id;
  await c.save();
  const other = c.participants.find(p=>!p._id.equals(req.user._id));
  req.app.get('io').to(`user:${other._id}`).emit('new-message', { ...message.toObject(), conversationId:c._id });
    res.status(201).json({message});
}
