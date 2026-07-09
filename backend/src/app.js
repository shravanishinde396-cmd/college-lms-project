import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import noticeRoutes from './routes/noticeRoutes.js';
import timetableRoutes from './routes/timetableRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, true);
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (_req, res) => res.json({ success: true, message: 'API healthy' }));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
