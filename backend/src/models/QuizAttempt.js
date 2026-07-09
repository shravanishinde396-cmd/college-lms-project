import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [{ questionIndex: Number, selectedOption: Number }],
  score: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  passed: { type: Boolean, default: false },
}, { timestamps: true });

// Optimize query for student history attempts
quizAttemptSchema.index({ student: 1, quiz: 1 });

export default mongoose.model('QuizAttempt', quizAttemptSchema);
