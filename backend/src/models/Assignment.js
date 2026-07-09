import mongoose from 'mongoose';
export default mongoose.model('Assignment', new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dueDate: { type: Date, required: true },
  attachment: String,
  totalMarks: { type: Number, default: 100 },
}, { timestamps: true }));
