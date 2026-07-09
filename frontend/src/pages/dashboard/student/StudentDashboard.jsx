import { useEffect, useState } from 'react';
import api from '../../../api/axios';
import PageHeader from '../../../components/common/PageHeader';
import SectionMessage from '../../../components/common/SectionMessage';
import StatCard from '../../../components/common/StatCard';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { 
  BookOpen, 
  CheckSquare, 
  Award, 
  ClipboardList,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Skeleton from '../../../components/common/Skeleton';

export default function StudentDashboard() {
  const [data, setData] = useState({ stats: {}, notices: [] });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then(({ data }) => {
        setData({ stats: data.stats || {}, notices: data.notices || [] });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Unable to load student dashboard.');
        setLoading(false);
      });
  }, []);

  const statConfig = {
    enrolledCourses: { label: 'Enrolled Courses', icon: BookOpen },
    submissions: { label: 'Assignments Submitted', icon: CheckSquare },
    quizzesTaken: { label: 'Quizzes Taken', icon: Award },
    attendancePercentage: { label: 'Attendance Rate', icon: ClipboardList, suffix: '%' },
    averageQuiz: { label: 'Avg Quiz Score', icon: Award, suffix: '%' },
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Student Dashboard" subtitle="Monitor your courses, quizzes, and attendance." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-3 mt-6">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Student Dashboard" 
        subtitle="Monitor your courses, quizzes, and attendance." 
        action={
          <Link to="/student/courses">
            <Button className="flex items-center gap-1.5 text-xs py-2">
              Go to Classroom <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        }
      />

      {error && <SectionMessage title="Dashboard error" message={error} tone="error" />}

      {!error && (
        <>
          {/* Stats grid */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {Object.entries(data.stats || {}).map(([key, val]) => {
              const cfg = statConfig[key] || { label: key, icon: BookOpen };
              const displayVal = cfg.suffix ? `${val}${cfg.suffix}` : val;
              return (
                <StatCard 
                  key={key} 
                  label={cfg.label} 
                  value={displayVal} 
                  icon={cfg.icon} 
                />
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Quick overview / status info */}
            <Card className="lg:col-span-2 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Welcome Back!</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Keep up the great work. Check your upcoming course timetables, submitted assignments status, and notice boards for announcements from the department.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <Link to="/student/timetable" className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 transition-colors">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Timetable</h4>
                    <p className="text-xs text-slate-400">View weekly classes</p>
                  </div>
                </Link>

                <Link to="/student/assignments" className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 transition-colors">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-650 dark:text-emerald-400">
                    <CheckSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Assignments</h4>
                    <p className="text-xs text-slate-400">Submit pending work</p>
                  </div>
                </Link>
              </div>
            </Card>

            {/* Notices */}
            <Card>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Latest Notices</h3>
              <div className="space-y-4">
                {(data.notices || []).length ? (
                  (data.notices || []).map(notice => (
                    <div key={notice._id} className="border-b border-slate-100 dark:border-slate-800 pb-3 last:border-b-0 last:pb-0">
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{notice.title}</h4>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{notice.message}</p>
                      <span className="mt-2 block text-[10px] text-slate-400">
                        {notice.createdAt ? new Date(notice.createdAt).toLocaleDateString() : 'Just now'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 py-4 text-center">No notices posted yet.</p>
                )}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
