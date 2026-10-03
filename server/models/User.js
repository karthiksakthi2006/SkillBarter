import mongoose from 'mongoose';
const skillSchema = new mongoose.Schema({ skill: { type: String, trim: true }, level: { type: String, default: 'Beginner' } }, { _id: false });

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true, trim: true, minlength: 3, maxlength: 20, match: /^[a-z0-9._]+$/ },
  displayName: { type: String, required: true, trim: true, maxlength: 60 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  bio: { type: String, default: '', maxlength: 500 },
  avatar: { type: String, default: '' },
  location: { type: String, default: '' },
  canTeach: { type: [skillSchema], default: [] },
  wantsToLearn: { type: [String], default: [] },
  availability: { type: [String], default: [] },
  languages: { type: [String], default: ['English'] },
  profileViews: { type: Number, default: 0 },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

userSchema.set('toJSON', {
  transform: (_, ret) => { delete ret.passwordHash; delete ret.__v; return ret; }
});

export default mongoose.model('User', userSchema);
