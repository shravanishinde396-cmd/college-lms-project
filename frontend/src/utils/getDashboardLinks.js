import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  BookOpen, 
  Megaphone, 
  Calendar, 
  User, 
  Settings,
  GraduationCap,
  ClipboardList,
  CheckSquare,
  FileCheck,
  Award
} from 'lucide-react';

const links = {
  admin: [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Manage Users', icon: Users },
    { to: '/admin/departments', label: 'Departments', icon: Building2 },
    { to: '/admin/courses', label: 'Courses', icon: BookOpen },
    { to: '/admin/notices', label: 'Notices', icon: Megaphone },
    { to: '/admin/timetable', label: 'Timetable', icon: Calendar },
    { to: '/admin/profile', label: 'Profile', icon: User },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ],
  faculty: [
    { to: '/faculty', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/faculty/courses', label: 'My Courses', icon: BookOpen },
    { to: '/faculty/attendance', label: 'Attendance', icon: ClipboardList },
    { to: '/faculty/assignments', label: 'Assignments', icon: CheckSquare },
    { to: '/faculty/quizzes', label: 'Quizzes', icon: Award },
    { to: '/faculty/submissions', label: 'Submissions', icon: FileCheck },
    { to: '/faculty/profile', label: 'Profile', icon: User },
    { to: '/faculty/settings', label: 'Settings', icon: Settings },
  ],
  student: [
    { to: '/student', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/courses', label: 'My Courses', icon: BookOpen },
    { to: '/student/assignments', label: 'Assignments', icon: CheckSquare },
    { to: '/student/attendance', label: 'Attendance', icon: ClipboardList },
    { to: '/student/results', label: 'Results', icon: Award },
    { to: '/student/notices', label: 'Notices', icon: Megaphone },
    { to: '/student/timetable', label: 'Timetable', icon: Calendar },
    { to: '/student/profile', label: 'Profile', icon: User },
    { to: '/student/settings', label: 'Settings', icon: Settings },
  ],
};

export default function getDashboardLinks(role) {
  return links[role] || [];
}
