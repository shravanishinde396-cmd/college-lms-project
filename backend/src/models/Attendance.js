import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['present', 'absent'], default: 'present' },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// Optimize lookups for student summaries and reports
attendanceSchema.index({ student: 1, course: 1, date: -1 });
attendanceSchema.index({ course: 1, date: -1 });

export default mongoose.model('Attendance', attendanceSchema);
