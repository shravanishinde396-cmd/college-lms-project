import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema({
  title: String,
  type: { type: String, enum: ['pdf', 'ppt', 'doc', 'video', 'link'], default: 'pdf' },
  fileUrl: String,
  externalUrl: String,
}, { _id: true, timestamps: true });

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  semester: { type: Number, default: 1 },
  credits: { type: Number, default: 3 },
  thumbnail: String,
  materials: [materialSchema],
  announcements: [{ message: String, createdAt: { type: Date, default: Date.now } }],
}, { timestamps: true });

export default mongoose.model('Course', courseSchema);
