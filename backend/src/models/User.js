import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { normalizeRole } from '../utils/roleHelpers.js';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'faculty', 'teacher', 'student'], default: 'student' },
  avatar: { type: String, default: '' },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  isActive: { type: Boolean, default: true },
  refreshToken: { type: String, default: '' },
  resetPasswordToken: { type: String, default: '' },
  resetPasswordExpires: { type: Date },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  this.role = normalizeRole(this.role);
  if (this.email) this.email = this.email.toLowerCase().trim();
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function(password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);
