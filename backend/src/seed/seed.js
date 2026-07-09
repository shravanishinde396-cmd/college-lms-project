import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Department from '../models/Department.js';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import TeacherProfile from '../models/TeacherProfile.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Assignment from '../models/Assignment.js';
import Notice from '../models/Notice.js';
import Timetable from '../models/Timetable.js';
import Quiz from '../models/Quiz.js';
import Attendance from '../models/Attendance.js';

dotenv.config({ path: './.env' });
await connectDB();

await Promise.all([
  Department.deleteMany(), User.deleteMany(), StudentProfile.deleteMany(), TeacherProfile.deleteMany(),
  Course.deleteMany(), Enrollment.deleteMany(), Assignment.deleteMany(), Notice.deleteMany(), Timetable.deleteMany(), Quiz.deleteMany(), Attendance.deleteMany()
]);

const cse = await Department.create({ name: 'Computer Science', code: 'CSE', description: 'Modern computing program' });
const it = await Department.create({ name: 'Information Technology', code: 'IT', description: 'Software, systems, and networking' });

const admin = await User.create({ name: 'Admin User', email: 'admin@college.edu', password: 'Admin@123', role: 'admin', department: cse._id });
const faculty = await User.create({ name: 'Anita Faculty', email: 'anita.faculty@college.edu', password: 'Faculty@123', role: 'faculty', department: cse._id });
const faculty2 = await User.create({ name: 'Rahul Faculty', email: 'rahul.faculty@college.edu', password: 'Faculty@123', role: 'faculty', department: it._id });
const student = await User.create({ name: 'Student One', email: 'student1@college.edu', password: 'Student@123', role: 'student', department: cse._id });
const student2 = await User.create({ name: 'Student Two', email: 'student2@college.edu', password: 'Student@123', role: 'student', department: cse._id });

await TeacherProfile.insertMany([
  { user: faculty._id, designation: 'Assistant Professor', qualification: 'M.Tech' },
  { user: faculty2._id, designation: 'Assistant Professor', qualification: 'M.Tech' }
]);

await StudentProfile.insertMany([
  { user: student._id, rollNumber: 'CS2026-001', semester: 6, phone: '9999999999' },
  { user: student2._id, rollNumber: 'CS2026-002', semester: 6, phone: '8888888888' }
]);

const ds = await Course.create({
  title: 'Data Structures',
  code: 'CSE301',
  description: 'Stacks, queues, linked lists, trees, graphs, and problem solving.',
  teacher: faculty._id,
  department: cse._id,
  semester: 4,
  credits: 4,
  materials: [{ title: 'DS Notes Unit 1', type: 'pdf', externalUrl: 'https://example.com/ds-notes' }],
  announcements: [{ message: 'Welcome to Data Structures' }]
});

const web = await Course.create({
  title: 'Web Development',
  code: 'CSE302',
  description: 'HTML, CSS, JavaScript, React basics, and backend integration.',
  teacher: faculty._id,
  department: cse._id,
  semester: 4,
  credits: 4,
  materials: [{ title: 'React Starter Guide', type: 'link', externalUrl: 'https://example.com/react-guide' }],
  announcements: [{ message: 'Project groups will be announced soon' }]
});

const dbms = await Course.create({
  title: 'Database Management',
  code: 'IT401',
  description: 'ER modelling, SQL, indexing, transactions, and normalization.',
  teacher: faculty2._id,
  department: it._id,
  semester: 4,
  credits: 3
});

await Enrollment.insertMany([
  { student: student._id, course: ds._id, status: 'approved', progress: 45 },
  { student: student._id, course: web._id, status: 'approved', progress: 30 },
  { student: student2._id, course: ds._id, status: 'approved', progress: 50 },
  { student: student2._id, course: web._id, status: 'approved', progress: 20 }
]);

await Assignment.insertMany([
  { title: 'Stack Implementation', description: 'Upload a C program for stack using array.', course: ds._id, teacher: faculty._id, dueDate: new Date(Date.now() + 5*24*60*60*1000), totalMarks: 100 },
  { title: 'Responsive Landing Page', description: 'Build a responsive college landing page.', course: web._id, teacher: faculty._id, dueDate: new Date(Date.now() + 7*24*60*60*1000), totalMarks: 100 }
]);

await Quiz.create({
  title: 'Web Basics Quiz',
  course: web._id,
  teacher: faculty._id,
  durationMinutes: 20,
  passPercentage: 40,
  questions: [
    { question: 'Which library is used for component-based UI?', options: ['Express', 'React', 'MongoDB', 'Node'], correctAnswer: 1, marks: 2 },
    { question: 'Which protocol loads websites?', options: ['FTP', 'SMTP', 'HTTP', 'SSH'], correctAnswer: 2, marks: 2 }
  ]
});

await Notice.insertMany([
  { title: 'Mid-Sem Project Demo', message: 'Project demo submissions open from Monday.', audience: 'all', postedBy: admin._id },
  { title: 'Faculty Meeting', message: 'All faculty members meet in Seminar Hall at 2 PM.', audience: 'teachers', postedBy: admin._id }
]);

await Timetable.insertMany([
  { course: ds._id, department: cse._id, semester: 4, day: 'Monday', startTime: '10:00', endTime: '11:00', room: 'Lab 4' },
  { course: web._id, department: cse._id, semester: 4, day: 'Wednesday', startTime: '12:00', endTime: '01:00', room: 'Lab 5' }
]);

await Attendance.insertMany([
  { course: ds._id, student: student._id, date: new Date(), status: 'present', markedBy: faculty._id },
  { course: ds._id, student: student2._id, date: new Date(), status: 'absent', markedBy: faculty._id }
]);

console.log('Seed data inserted successfully');
console.log('Admin: admin@college.edu / Admin@123');
console.log('Faculty: anita.faculty@college.edu / Faculty@123');
console.log('Student: student1@college.edu / Student@123');
await mongoose.connection.close();
