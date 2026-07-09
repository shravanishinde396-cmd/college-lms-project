import { useEffect, useState } from 'react';
import api from '../../../api/axios';
import PageHeader from '../../../components/common/PageHeader';
import SectionMessage from '../../../components/common/SectionMessage';
import StatCard from '../../../components/common/StatCard';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  CheckSquare, 
  Megaphone,
  PlusCircle
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

export default function AdminDashboard() {
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
        setError(err.response?.data?.message || 'Unable to load admin dashboard.');
        setLoading(false);
      });
  }, []);

  const statConfig = {
    students: { label: 'Total Students', icon: Users, trend: { type: 'up', value: '4.8%', label: 'this semester' } },
    faculty: { label: 'Faculty Members', icon: GraduationCap, trend: { type: 'up', value: '1.2%', label: 'new hires' } },
    courses: { label: 'Active Courses', icon: BookOpen, trend: { type: 'up', value: '12%', label: 'added' } },
    assignments: { label: 'Assignments Set', icon: CheckSquare, trend: { type: 'up', value: '8.4%', label: 'submissions active' } },
  };

  const chartData = [
    { name: 'Students', count: data.stats?.students || 0, fill: '#6366f1' },
    { name: 'Faculty', count: data.stats?.faculty || 0, fill: '#3b82f6' },
    { name: 'Courses', count: data.stats?.courses || 0, fill: '#10b981' },
    { name: 'Assignments', count: data.stats?.assignments || 0, fill: '#f59e0b' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Admin Dashboard" subtitle="Manage the entire LMS platform." />
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
        title="Admin Dashboard" 
        subtitle="Manage the entire LMS platform." 
        action={
          <div className="flex gap-2">
            <Link to="/admin/users">
              <Button variant="secondary" className="flex items-center gap-1.5 text-xs py-2">
                <PlusCircle className="h-4 w-4" /> Manage Users
              </Button>
            </Link>
            <Link to="/admin/notices">
              <Button className="flex items-center gap-1.5 text-xs py-2">
                <Megaphone className="h-4 w-4" /> Post Notice
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
              const cfg = statConfig[key] || { label: key, icon: Users };
              return (
                <StatCard 
                  key={key} 
                  label={cfg.label} 
                  value={val} 
                  icon={cfg.icon} 
                  trend={cfg.trend}
                />
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Chart */}
            <Card className="lg:col-span-2">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">LMS Metrics Overview</h3>
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Notices</h3>
                <Megaphone className="h-5 w-5 text-slate-400" />
              </div>
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
