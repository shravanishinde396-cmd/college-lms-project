import mongoose from 'mongoose';
export default mongoose.model('TeacherProfile', new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  designation: String,
  qualification: String,
  phone: String,
}, { timestamps: true }));
