import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  progress: { type: Number, default: 0 },
}, { timestamps: true });

// Optimize query path for student enrolled course lists and course analytics
enrollmentSchema.index({ student: 1, status: 1 });
enrollmentSchema.index({ course: 1 });

export default mongoose.model('Enrollment', enrollmentSchema);
