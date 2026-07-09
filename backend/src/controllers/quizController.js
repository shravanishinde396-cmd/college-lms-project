import asyncHandler from 'express-async-handler';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';

export const getQuizzes = asyncHandler(async (req, res) => {
  const filter = req.query.course ? { course: req.query.course } : {};
  const quizzes = await Quiz.find(filter).populate('course teacher').sort({ createdAt: -1 });
  res.json({ success: true, quizzes });
});

export const getQuizById = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id).populate('course teacher');
  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }
  res.json({ success: true, quiz });
});

export const createQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.create({ ...req.body, teacher: req.user._id });
  res.status(201).json({ success: true, quiz });
});

export const attemptQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }
  const answers = req.body.answers || [];
  let score = 0;
  let total = 0;
  quiz.questions.forEach((q, index) => {
    total += q.marks;
    const answer = answers.find(a => Number(a.questionIndex) === index);
    if (answer && Number(answer.selectedOption) === q.correctAnswer) score += q.marks;
  });
  const percentage = total ? (score / total) * 100 : 0;
  const attempt = await QuizAttempt.create({
    quiz: quiz._id,
    student: req.user._id,
    answers,
    score,
    percentage,
    passed: percentage >= quiz.passPercentage,
  });
  res.status(201).json({ success: true, attempt });
});

export const getAttempts = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'student' ? { student: req.user._id } : {};
  const attempts = await QuizAttempt.find(filter).populate('quiz').populate('student', 'name email');
  res.json({ success: true, attempts });
});
