import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  semester: { type: Number, required: true },
  day: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  room: { type: String, required: true },
}, { timestamps: true });

// Optimize lookups by department and semester (common weekly timetable view)
timetableSchema.index({ department: 1, semester: 1 });

export default mongoose.model('Timetable', timetableSchema);
