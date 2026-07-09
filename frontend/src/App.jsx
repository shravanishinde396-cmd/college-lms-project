import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';

import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import CoursesPage from './pages/public/CoursesPage';
import ContactPage from './pages/public/ContactPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

import AdminDashboard from './pages/dashboard/admin/AdminDashboard';
import ManageUsersPage from './pages/dashboard/admin/ManageUsersPage';
import ManageDepartmentsPage from './pages/dashboard/admin/ManageDepartmentsPage';
import ManageCoursesPage from './pages/dashboard/admin/ManageCoursesPage';
import ManageNoticesPage from './pages/dashboard/admin/ManageNoticesPage';
import ManageTimetablePage from './pages/dashboard/admin/ManageTimetablePage';

import TeacherDashboard from './pages/dashboard/teacher/TeacherDashboard';
import TeacherCoursesPage from './pages/dashboard/teacher/TeacherCoursesPage';
import TeacherAttendancePage from './pages/dashboard/teacher/TeacherAttendancePage';
import TeacherAssignmentsPage from './pages/dashboard/teacher/TeacherAssignmentsPage';
import TeacherQuizzesPage from './pages/dashboard/teacher/TeacherQuizzesPage';
import TeacherSubmissionsPage from './pages/dashboard/teacher/TeacherSubmissionsPage';

import StudentDashboard from './pages/dashboard/student/StudentDashboard';
import StudentCoursesPage from './pages/dashboard/student/StudentCoursesPage';
import StudentAssignmentsPage from './pages/dashboard/student/StudentAssignmentsPage';
import StudentAttendancePage from './pages/dashboard/student/StudentAttendancePage';
import StudentResultsPage from './pages/dashboard/student/StudentResultsPage';
import StudentNoticesPage from './pages/dashboard/student/StudentNoticesPage';
import StudentTimetablePage from './pages/dashboard/student/StudentTimetablePage';

import ProfilePage from './pages/dashboard/shared/ProfilePage';
import SettingsPage from './pages/dashboard/shared/SettingsPage';
import CourseDetailsPage from './pages/dashboard/shared/CourseDetailsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Navigate to="/login" replace />} />

          <Route element={<RoleRoute allowed={['admin']} />}>
            <Route path="/admin" element={<DashboardLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<ManageUsersPage />} />
              <Route path="departments" element={<ManageDepartmentsPage />} />
              <Route path="courses" element={<ManageCoursesPage />} />
              <Route path="notices" element={<ManageNoticesPage />} />
              <Route path="timetable" element={<ManageTimetablePage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="course/:id" element={<CourseDetailsPage />} />
            </Route>
          </Route>

          <Route element={<RoleRoute allowed={['faculty']} />}>
            <Route path="/faculty" element={<DashboardLayout />}>
              <Route index element={<TeacherDashboard />} />
              <Route path="courses" element={<TeacherCoursesPage />} />
              <Route path="attendance" element={<TeacherAttendancePage />} />
              <Route path="assignments" element={<TeacherAssignmentsPage />} />
              <Route path="quizzes" element={<TeacherQuizzesPage />} />
              <Route path="submissions" element={<TeacherSubmissionsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="course/:id" element={<CourseDetailsPage />} />
            </Route>
          </Route>

          <Route element={<RoleRoute allowed={['student']} />}>
            <Route path="/student" element={<DashboardLayout />}>
              <Route index element={<StudentDashboard />} />
              <Route path="courses" element={<StudentCoursesPage />} />
              <Route path="assignments" element={<StudentAssignmentsPage />} />
              <Route path="attendance" element={<StudentAttendancePage />} />
              <Route path="results" element={<StudentResultsPage />} />
              <Route path="notices" element={<StudentNoticesPage />} />
              <Route path="timetable" element={<StudentTimetablePage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="course/:id" element={<CourseDetailsPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}