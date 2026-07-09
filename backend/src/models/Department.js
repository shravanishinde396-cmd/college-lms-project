import mongoose from 'mongoose';
export default mongoose.model('Department', new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true },
  description: String,
}, { timestamps: true }));
