import { useEffect, useMemo, useState } from 'react';
import api from '../../../api/axios';
import PageHeader from '../../../components/common/PageHeader';
import Card from '../../../components/ui/Card';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Calendar,
  Percent,
  TrendingUp
} from 'lucide-react';
import Skeleton from '../../../components/common/Skeleton';

export default function StudentAttendancePage() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/attendance')
      .then(({ data }) => {
        setAttendance(data.attendance || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Overall statistics
  const totalClasses = attendance.length;
  const presentClasses = attendance.filter(a => a.status === 'present').length;
  const absentClasses = totalClasses - presentClasses;
  
  const overallPercentage = totalClasses 
    ? Math.round((presentClasses / totalClasses) * 100) 
    : 0;

  // Breakdown per Course
  const courseBreakdown = useMemo(() => {
    const coursesMap = {};
    attendance.forEach(record => {
      const courseId = record.course?._id;
      if (!courseId) return;

      if (!coursesMap[courseId]) {
        coursesMap[courseId] = {
          title: record.course.title,
          code: record.course.code,
          present: 0,
          total: 0
        };
      }
      coursesMap[courseId].total++;
      if (record.status === 'present') {
        coursesMap[courseId].present++;
      }
    });

    return Object.values(coursesMap).map(c => ({
      ...c,
      percentage: Math.round((c.present / c.total) * 100)
    }));
  }, [attendance]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Attendance" subtitle="View class attendance ratios." />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-64 w-full mt-6" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="My Attendance" subtitle="View class attendance ratios." />

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-4">
          <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400">
            <Percent className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-405 dark:text-slate-500 uppercase tracking-wider">Attendance Rate</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{overallPercentage}%</h3>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-650 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-405 dark:text-slate-500 uppercase tracking-wider">Classes Present</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{presentClasses} / {totalClasses}</h3>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className={`h-12 w-12 flex items-center justify-center rounded-xl ${
            overallPercentage >= 75 ? 'bg-amber-50 text-amber-650 dark:bg-amber-950/20 dark:text-amber-400' : 'bg-rose-50 text-rose-650 dark:bg-rose-950/20 dark:text-rose-400'
          }`}>
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-405 dark:text-slate-500 uppercase tracking-wider">Status Warning</p>
            <h3 className={`text-sm font-bold mt-1.5 ${
              overallPercentage >= 75 ? 'text-emerald-600 dark:text-emerald-455' : 'text-rose-650 dark:text-rose-455'
            }`}>
              {overallPercentage >= 75 ? 'Good standing (>= 75%)' : 'Below 75% required!'}
            </h3>
          </div>
        </Card>
      </div>

      {attendance.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Subject Wise breakdown */}
          <Card className="lg:col-span-1 space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
              Subject Wise Breakdown
            </h3>
            
            <div className="space-y-4">
              {courseBreakdown.map((c, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{c.title}</span>
                    <span className={c.percentage >= 75 ? 'text-emerald-600 dark:text-emerald-450' : 'text-rose-600 dark:text-rose-450'}>
                      {c.percentage}%
                    </span>
                  </div>
                  {/* Progress bar wrapper */}
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        c.percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${c.percentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block">Attended {c.present} of {c.total} classes</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Daily Logs Table */}
          <Card className="lg:col-span-2">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">Daily Logs</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-405 text-xs font-bold uppercase">
                    <th className="pb-3">Course Title</th>
                    <th className="pb-3">Log Date</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {attendance.map((a) => (
                    <tr key={a._id} className="hover:bg-slate-50/20 dark:hover:bg-slate-800/10 transition-colors">
                      <td className="py-3 font-semibold text-slate-900 dark:text-white">{a.course?.title}</td>
                      <td className="py-3 text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {new Date(a.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-right">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          a.status === 'present' 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' 
                            : 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'
                        }`}>
                          {a.status === 'present' ? 'Present' : 'Absent'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-slate-500">No attendance logs available.</p>
        </Card>
      )}
    </div>
  );
}
