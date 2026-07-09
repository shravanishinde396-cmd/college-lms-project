import { useEffect, useState } from 'react';
import api from '../../../api/axios';
import PageHeader from '../../../components/common/PageHeader';
import Card from '../../../components/ui/Card';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Award, CheckCircle, XCircle, TrendingUp, BarChart2 } from 'lucide-react';
import Skeleton from '../../../components/common/Skeleton';

const COLORS = ['#10b981', '#f43f5e'];

export default function StudentResultsPage() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/quizzes/attempts/all')
      .then(({ data }) => {
        setAttempts(data.attempts || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Compute analytics metrics
  const totalQuizzes = attempts.length;
  const passedQuizzes = attempts.filter(a => a.passed).length;
  const failedQuizzes = totalQuizzes - passedQuizzes;
  
  const avgPercentage = totalQuizzes 
    ? Math.round(attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / totalQuizzes)
    : 0;

  const highestPercentage = totalQuizzes
    ? Math.round(Math.max(...attempts.map(a => a.percentage || 0)))
    : 0;

  const pieData = [
    { name: 'Passed', value: passedQuizzes },
    { name: 'Failed', value: failedQuizzes },
  ];

  // Map quiz attempts over time for trend line chart
  const timelineData = attempts.slice().reverse().map((a, idx) => ({
    index: idx + 1,
    name: a.quiz?.title || `Quiz ${idx + 1}`,
    score: Math.round(a.percentage || 0),
  }));

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Quiz Results" subtitle="Detailed breakdown of your test scores." />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 mt-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Quiz Results" subtitle="Detailed breakdown of your test scores." />

      {/* Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-4">
          <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-405 dark:text-slate-500 uppercase tracking-wider">Total Quizzes</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalQuizzes}</h3>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-650 dark:text-emerald-400">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-405 dark:text-slate-500 uppercase tracking-wider">Average Score</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{avgPercentage}%</h3>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-650 dark:text-amber-400">
            <BarChart2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-405 dark:text-slate-500 uppercase tracking-wider">Highest Score</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{highestPercentage}%</h3>
          </div>
        </Card>
      </div>

      {attempts.length > 0 ? (
        <>
          {/* Charts Row */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Trend Chart */}
            <Card className="md:col-span-2">
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">Quiz Score Trends</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                    <XAxis dataKey="index" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Pie Chart */}
            <Card className="flex flex-col justify-between">
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2">Pass Rate Ratio</h3>
              <div className="h-44 w-full flex justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> {passedQuizzes} Passed</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> {failedQuizzes} Failed</span>
              </div>
            </Card>
          </div>

          {/* Results Table */}
          <Card>
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">Quiz Logs</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-xs font-bold uppercase">
                    <th className="pb-3">Quiz Title</th>
                    <th className="pb-3">Points Scored</th>
                    <th className="pb-3">Grade Percentage</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Date Taken</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {attempts.map((a) => (
                    <tr key={a._id} className="hover:bg-slate-50/20 dark:hover:bg-slate-800/10 transition-colors">
                      <td className="py-3 font-semibold text-slate-900 dark:text-white">{a.quiz?.title || 'LMS Quiz'}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-400">{a.score} pts</td>
                      <td className="py-3 font-mono font-bold">{Math.round(a.percentage)}%</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          a.passed 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' 
                            : 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'
                        }`}>
                          {a.passed ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {a.passed ? 'Pass' : 'Fail'}
                        </span>
                      </td>
                      <td className="py-3 text-right text-slate-400">{new Date(a.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-slate-500">You haven't attempted any quizzes yet.</p>
        </Card>
      )}
    </div>
  );
}
