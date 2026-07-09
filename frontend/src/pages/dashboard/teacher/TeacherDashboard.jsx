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
  FileCheck, 
  ClipboardList,
  PlusCircle,
  FileSpreadsheet
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Link } from 'react-router-dom';
import Skeleton from '../../../components/common/Skeleton';

export default function TeacherDashboard() {
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
        setError(err.response?.data?.message || 'Unable to load faculty dashboard.');
        setLoading(false);
      });
  }, []);

  const statConfig = {
    myCourses: { label: 'My Courses', icon: BookOpen },
    assignments: { label: 'Assignments Set', icon: CheckSquare },
    submissions: { label: 'Submissions Received', icon: FileCheck },
    attendance: { label: 'Attendance Records', icon: ClipboardList },
  };

  const chartData = [
    { name: 'My Courses', count: data.stats?.myCourses || 0, fill: '#6366f1' },
    { name: 'Assignments', count: data.stats?.assignments || 0, fill: '#3b82f6' },
    { name: 'Submissions', count: data.stats?.submissions || 0, fill: '#10b981' },
    { name: 'Attendance', count: data.stats?.attendance || 0, fill: '#f59e0b' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Faculty Dashboard" subtitle="Track teaching activity and student engagement." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-80 w-full mt-6" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Faculty Dashboard" 
        subtitle="Track teaching activity and student engagement." 
        action={
          <div className="flex gap-2">
            <Link to="/faculty/attendance">
              <Button variant="secondary" className="flex items-center gap-1.5 text-xs py-2">
                <FileSpreadsheet className="h-4 w-4" /> Mark Attendance
              </Button>
            </Link>
            <Link to="/faculty/assignments">
              <Button className="flex items-center gap-1.5 text-xs py-2">
                <PlusCircle className="h-4 w-4" /> Create Assignment
              </Button>
            </Link>
          </div>
        }
      />

      {error && <SectionMessage title="Dashboard error" message={error} tone="error" />}

      {!error && (
        <>
          {/* Stats grid */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Object.entries(data.stats || {}).map(([key, val]) => {
              const cfg = statConfig[key] || { label: key, icon: BookOpen };
              return (
                <StatCard 
                  key={key} 
                  label={cfg.label} 
                  value={val} 
                  icon={cfg.icon} 
                />
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Chart */}
            <Card className="lg:col-span-2">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Class Performance Overview</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px' }} />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Notices */}
            <Card>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Recent Campus Notices</h3>
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
