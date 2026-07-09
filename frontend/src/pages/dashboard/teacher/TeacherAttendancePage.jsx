import { useEffect, useMemo, useState } from 'react';
import api from '../../../api/axios';
import PageHeader from '../../../components/common/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import toast from 'react-hot-toast';
import { 
  ClipboardList, 
  FileSpreadsheet, 
  UserCheck, 
  Calendar,
  CheckCircle,
  XCircle,
  FileDown
} from 'lucide-react';

export default function TeacherAttendancePage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courseDetails, setCourseDetails] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [records, setRecords] = useState({});
  const [activeSubTab, setActiveSubTab] = useState('mark'); // 'mark' or 'report'
  
  // Report filters
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [monthlyReportData, setMonthlyReportData] = useState([]);

  useEffect(() => {
    api.get('/courses/my-courses').then(({ data }) => {
      const list = data.courses || [];
      setCourses(list);
      if (list[0]) setSelectedCourse(list[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    api.get(`/courses/${selectedCourse}`).then(({ data }) => {
      setCourseDetails(data);
      const nextRecords = {};
      (data.enrollments || []).forEach((enrollment) => {
        nextRecords[enrollment.student._id] = 'present';
      });
      setRecords(nextRecords);
    });
  }, [selectedCourse]);

  const students = useMemo(() => courseDetails?.enrollments || [], [courseDetails]);

  const save = async () => {
    if (!selectedCourse || !students.length) return;
    try {
      await api.post('/attendance', {
        course: selectedCourse,
        date,
        records: students.map((enrollment) => ({
          student: enrollment.student._id,
          status: records[enrollment.student._id] || 'present'
        }))
      });
      toast.success('Attendance saved successfully!');
    } catch (err) {
      toast.error('Failed to save attendance');
    }
  };

  const fetchMonthlyReport = async () => {
    if (!selectedCourse) return;
    try {
      const { data } = await api.get(
        `/attendance/monthly-report?course=${selectedCourse}&month=${reportMonth}&year=${reportYear}`
      );
      setMonthlyReportData(data.report || []);
      toast.success('Monthly report updated');
    } catch (err) {
      toast.error('Failed to load monthly report');
    }
  };

  useEffect(() => {
    if (activeSubTab === 'report' && selectedCourse) {
      fetchMonthlyReport();
    }
  }, [activeSubTab, selectedCourse, reportMonth, reportYear]);

  // Export report to CSV
  const exportToCSV = () => {
    if (!monthlyReportData.length) return;
    const headers = ['Student Name', 'Student Email', 'Present Days', 'Absent Days', 'Total Days', 'Attendance Rate'];
    const rows = monthlyReportData.map(r => [
      r.student?.name || 'N/A',
      r.student?.email || 'N/A',
      r.present,
      r.absent,
      r.total,
      `${r.percentage}%`
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Attendance_Report_Month_${reportMonth}_Year_${reportYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Faculty Attendance" 
        subtitle="Manage student attendance logs and monthly aggregated reports." 
        action={
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveSubTab('mark')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeSubTab === 'mark' 
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Mark Daily
            </button>
            <button
              onClick={() => setActiveSubTab('report')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeSubTab === 'report' 
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Monthly Report
            </button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        {/* Left Control Panel */}
        <Card className="h-fit">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Subject Course</label>
              <select 
                className="input" 
                value={selectedCourse} 
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                <option value="">Select course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>{course.title}</option>
                ))}
              </select>
            </div>

            {activeSubTab === 'mark' ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Selected Date</label>
                  <input 
                    className="input" 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                  />
                </div>
                <Button 
                  onClick={save} 
                  className="w-full flex items-center justify-center gap-2"
                  disabled={!selectedCourse || !students.length}
                >
                  <UserCheck className="h-4 w-4" /> Save Attendance
                </Button>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Month</label>
                    <select 
                      className="input" 
                      value={reportMonth} 
                      onChange={e => setReportMonth(Number(e.target.value))}
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                        <option key={m} value={m}>
                          {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Year</label>
                    <select 
                      className="input" 
                      value={reportYear} 
                      onChange={e => setReportYear(Number(e.target.value))}
                    >
                      {[2024, 2025, 2026, 2027].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <Button 
                  onClick={exportToCSV} 
                  variant="secondary"
                  className="w-full flex items-center justify-center gap-2 border border-slate-200"
                  disabled={!monthlyReportData.length}
                >
                  <FileDown className="h-4 w-4" /> Export Report (CSV)
                </Button>
              </>
            )}

            <p className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-800">
              Need to add new subjects? Open courses and create one, or verify student enrollment lists with the administrative head.
            </p>
          </div>
        </Card>

        {/* Right Details Panel */}
        <Card>
          {activeSubTab === 'mark' ? (
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-indigo-500" /> Attendance Sheet
                </h3>
                <span className="text-xs text-slate-400 font-semibold">{students.length} Enrolled</span>
              </div>

              {students.length ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {students.map((enrollment) => (
                    <div key={enrollment._id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                      <div>
                        <p className="text-sm font-semibold text-slate-850 dark:text-white">{enrollment.student?.name}</p>
                        <p className="text-xs text-slate-450">{enrollment.student?.email}</p>
                      </div>
                      
                      <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-150 dark:border-slate-700">
                        <button
                          onClick={() => setRecords({ ...records, [enrollment.student._id]: 'present' })}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                            records[enrollment.student._id] !== 'absent'
                              ? 'bg-emerald-550 text-white shadow-sm'
                              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-205'
                          }`}
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> Present
                        </button>
                        <button
                          onClick={() => setRecords({ ...records, [enrollment.student._id]: 'absent' })}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                            records[enrollment.student._id] === 'absent'
                              ? 'bg-rose-550 text-white shadow-sm'
                              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-205'
                          }`}
                        >
                          <XCircle className="h-3.5 w-3.5" /> Absent
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-550 py-10 text-center">No enrolled students found. Make sure students join this course.</p>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-indigo-500" /> Monthly Aggregate
                </h3>
                <span className="text-xs text-slate-400 font-semibold">{monthlyReportData.length} Students tracked</span>
              </div>

              {monthlyReportData.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-150 dark:border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th className="py-2.5">Student Name</th>
                        <th className="py-2.5">Present Days</th>
                        <th className="py-2.5">Absent Days</th>
                        <th className="py-2.5">Total Days</th>
                        <th className="py-2.5 text-right">Attendance Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {monthlyReportData.map((row) => (
                        <tr key={row.student?._id}>
                          <td className="py-3 font-semibold text-slate-900 dark:text-white">{row.student?.name}</td>
                          <td className="py-3 text-emerald-600 dark:text-emerald-400 font-mono">{row.present}</td>
                          <td className="py-3 text-rose-600 dark:text-rose-400 font-mono">{row.absent}</td>
                          <td className="py-3 text-slate-500 font-mono">{row.total}</td>
                          <td className="py-3 text-right font-bold text-slate-900 dark:text-white">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              row.percentage >= 75 
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' 
                                : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400'
                            }`}>
                              {row.percentage}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-slate-500 py-10 text-center">No attendance logs found for this specific month/course combination.</p>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
