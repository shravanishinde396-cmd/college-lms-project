import mongoose from 'mongoose';
export default mongoose.model('Submission', new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileUrl: String,
  text: String,
  submittedAt: { type: Date, default: Date.now },
  marks: { type: Number, default: null },
  feedback: { type: String, default: '' },
  status: { type: String, enum: ['submitted', 'graded'], default: 'submitted' },
  isLate: { type: Boolean, default: false },
}, { timestamps: true }));
