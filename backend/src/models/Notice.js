import mongoose from 'mongoose';
export default mongoose.model('Notice', new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  audience: { type: String, enum: ['all', 'students', 'teachers'], default: 'all' },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true }));
