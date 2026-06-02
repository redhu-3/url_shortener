import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: false },
  googleId: { type: String, default: null },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpire: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.model('User', userSchema);