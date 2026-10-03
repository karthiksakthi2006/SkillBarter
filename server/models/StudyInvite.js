import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, default: 'Skill learning session', trim: true, maxlength: 120 },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  roomId: { type: String, default: '' }
}, { timestamps: true });

schema.index({ receiver: 1, status: 1, createdAt: -1 });
export default mongoose.model('StudyInvite', schema);
