import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  marks: { type: Number, default: 1 },
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  durationMinutes: { type: Number, default: 15 },
  passPercentage: { type: Number, default: 40 },
  questions: [questionSchema],
}, { timestamps: true });

export default mongoose.model('Quiz', quizSchema);
