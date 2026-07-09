import mongoose from 'mongoose';
export default mongoose.model('StudentProfile', new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  rollNumber: { type: String, unique: true },
  semester: { type: Number, default: 1 },
  phone: String,
}, { timestamps: true }));
