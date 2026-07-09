import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../api/axios';
import useAuth from '../../../hooks/useAuth';
import PageHeader from '../../../components/common/PageHeader';
import SectionMessage from '../../../components/common/SectionMessage';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Skeleton from '../../../components/common/Skeleton';
import toast from 'react-hot-toast';
import { 
  BookOpen, 
  FileText, 
  Megaphone, 
  PlusCircle, 
  GraduationCap, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Link as LinkIcon,
  Download,
  Award,
  CheckSquare,
  ChevronRight,
  Upload
} from 'lucide-react';

export default function CourseDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Creation Modals / Forms States
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [newMaterial, setNewMaterial] = useState({ title: '', type: 'pdf', fileUrl: '', externalUrl: '' });
  const [newAssignment, setNewAssignment] = useState({ title: '', description: '', dueDate: '', totalMarks: 100 });
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    durationMinutes: 15,
    passPercentage: 40,
    questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0, marks: 1 }]
  });

  // Active Quiz Attempt State (For Student)
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({}); // { questionIndex: selectedOption }
  const [quizTimer, setQuizTimer] = useState(0); // in seconds
  const quizTimerRef = useRef(null);

  // Active Grading State (For Teacher)
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradeForm, setGradeForm] = useState({ marks: '', feedback: '' });

  // File Upload Reference
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [submissionText, setSubmissionText] = useState('');

  const isTeacher = user?.role === 'faculty' || user?.role === 'teacher' || user?.role === 'admin';

  const fetchCourseData = async () => {
    try {
      const [courseRes, assRes, quizRes, attemptRes] = await Promise.all([
        api.get(`/courses/${id}`),
        api.get(`/assignments?course=${id}`),
        api.get(`/quizzes?course=${id}`),
        api.get('/quizzes/attempts/all')
      ]);

      setCourse(courseRes.data.course);
      setEnrollments(courseRes.data.enrollments || []);
      setAssignments(assRes.data.assignments || []);
      setQuizzes(quizRes.data.quizzes || []);
      
      // Filter student attempts for this course
      const courseAttempts = (attemptRes.data.attempts || []).filter(
        att => att.quiz && att.quiz.course === id
      );
      setAttempts(courseAttempts);

      if (isTeacher) {
        // Teachers get all submissions
        const subRes = await api.get('/assignments/submissions/all');
        setSubmissions(subRes.data.submissions.filter(s => s.assignment && s.assignment.course === id));
      } else {
        // Students get their own submissions
        const subRes = await api.get('/assignments/submissions/all');
        setSubmissions(subRes.data.submissions.filter(s => s.assignment && s.assignment.course === id && s.student?._id === user?._id));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load course details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
    return () => {
      if (quizTimerRef.current) clearInterval(quizTimerRef.current);
    };
  }, [id]);

  // Timer Effect
  useEffect(() => {
    if (activeQuiz && quizTimer > 0) {
      quizTimerRef.current = setInterval(() => {
        setQuizTimer(prev => {
          if (prev <= 1) {
            clearInterval(quizTimerRef.current);
            submitQuizAttempt(true); // Auto submit
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (quizTimerRef.current) clearInterval(quizTimerRef.current);
    };
  }, [activeQuiz, quizTimer]);

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.trim()) return;
    try {
      await api.put(`/courses/${id}`, {
        announcements: [...(course.announcements || []), { message: newAnnouncement }]
      });
      setNewAnnouncement('');
      toast.success('Announcement posted');
      fetchCourseData();
    } catch (err) {
      toast.error('Failed to post announcement');
    }
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    if (!newMaterial.title.trim()) return;
    try {
      await api.post(`/courses/${id}/materials`, newMaterial);
      setNewMaterial({ title: '', type: 'pdf', fileUrl: '', externalUrl: '' });
      toast.success('Material added');
      fetchCourseData();
    } catch (err) {
      toast.error('Failed to add material');
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      await api.post('/assignments', { ...newAssignment, course: id });
      setNewAssignment({ title: '', description: '', dueDate: '', totalMarks: 100 });
      toast.success('Assignment created');
      fetchCourseData();
    } catch (err) {
      toast.error('Failed to create assignment');
    }
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    try {
      await api.post('/quizzes', { ...newQuiz, course: id });
      setNewQuiz({
        title: '',
        durationMinutes: 15,
        passPercentage: 40,
        questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0, marks: 1 }]
      });
      toast.success('Quiz created');
      fetchCourseData();
    } catch (err) {
      toast.error('Failed to create quiz');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
  };

  const handleAssignmentSubmit = async (assignmentId) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('text', submissionText);
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      await api.post(`/assignments/${assignmentId}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSubmissionText('');
      setSelectedFile(null);
      toast.success('Assignment submitted successfully!');
      fetchCourseData();
    } catch (err) {
      toast.error('Failed to submit assignment');
    } finally {
      setUploading(false);
    }
  };

  const handleGradeSubmission = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/assignments/submissions/${gradingSubmission._id}/grade`, {
        marks: Number(gradeForm.marks),
        feedback: gradeForm.feedback
      });
      setGradingSubmission(null);
      setGradeForm({ marks: '', feedback: '' });
      toast.success('Grade submitted successfully!');
      fetchCourseData();
    } catch (err) {
      toast.error('Failed to grade submission');
    }
  };

  const startQuizAttempt = (quiz) => {
    setActiveQuiz(quiz);
    setQuizAnswers({});
    setQuizTimer(quiz.durationMinutes * 60);
    toast.success(`Quiz "${quiz.title}" started!`);
  };

  const submitQuizAttempt = async (auto = false) => {
    if (quizTimerRef.current) clearInterval(quizTimerRef.current);
    
    const formattedAnswers = Object.entries(quizAnswers).map(([index, option]) => ({
      questionIndex: Number(index),
      selectedOption: Number(option)
    }));

    try {
      await api.post(`/quizzes/${activeQuiz._id}/attempt`, {
        answers: formattedAnswers
      });
      toast.success(auto ? 'Time expired! Quiz submitted automatically.' : 'Quiz submitted successfully!');
      setActiveQuiz(null);
      fetchCourseData();
    } catch (err) {
      toast.error('Failed to submit quiz attempt');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) return <SectionMessage title="Course could not be opened" message={error} tone="error" />;
  if (!course) return <SectionMessage title="Course not found" message="This course may have been deleted." />;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Course Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-soft p-6 lg:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        {course.thumbnail && (
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none hidden md:block">
            <img src={`${api.defaults.baseURL.replace('/api', '')}${course.thumbnail}`} alt="Course cover" className="h-full w-full object-cover" />
          </div>
        )}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-700">
            {course.code} • {course.credits} Credits
          </span>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            {course.title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl">
            {course.description}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Instructor</p>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {course.teacher?.name || 'Unassigned'}
            </h4>
          </div>
        </div>
      </div>

      {/* active quiz timer popup */}
      {activeQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <Card className="w-full max-w-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold">{activeQuiz.title}</h3>
              <div className="flex items-center gap-2 bg-red-650 px-3 py-1 rounded-full text-sm font-mono animate-pulse">
                <Clock className="h-4 w-4" />
                <span>{formatTime(quizTimer)}</span>
              </div>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
              {activeQuiz.questions.map((q, qIdx) => (
                <div key={q._id} className="space-y-3">
                  <h4 className="font-semibold text-slate-900 dark:text-white text-base">
                    Q{qIdx + 1}. {q.question} <span className="text-xs text-slate-400">({q.marks} marks)</span>
                  </h4>
                  <div className="grid gap-2">
                    {q.options.map((option, oIdx) => (
                      <label 
                        key={oIdx} 
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          quizAnswers[qIdx] === oIdx 
                            ? 'border-slate-900 bg-slate-50 dark:border-white dark:bg-slate-800/50' 
                            : 'border-slate-100 hover:bg-slate-50/50 dark:border-slate-800 dark:hover:bg-slate-800/20'
                        }`}
                      >
                        <input 
                          type="radio" 
                          name={`q-${qIdx}`} 
                          checked={quizAnswers[qIdx] === oIdx}
                          onChange={() => setQuizAnswers(prev => ({ ...prev, [qIdx]: oIdx }))}
                          className="text-slate-900 focus:ring-slate-900" 
                        />
                        <span className="text-sm text-slate-800 dark:text-slate-350">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <Button onClick={() => submitQuizAttempt(false)}>Submit Quiz</Button>
            </div>
          </Card>
        </div>
      )}

      {/* grading submission modal popup */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold mb-4">Grade Submission</h3>
            <p className="text-sm text-slate-500 mb-4">
              Student: <strong className="text-slate-800 dark:text-white">{gradingSubmission.student?.name}</strong>
            </p>
            {gradingSubmission.text && (
              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl mb-4 text-sm text-slate-700 dark:text-slate-300">
                <p className="font-semibold mb-1">Student Note:</p>
                {gradingSubmission.text}
              </div>
            )}
            {gradingSubmission.fileUrl && (
              <a 
                href={`${api.defaults.baseURL.replace('/api', '')}${gradingSubmission.fileUrl}`} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 text-sm text-indigo-650 dark:text-indigo-400 hover:underline mb-6"
              >
                <Download className="h-4 w-4" /> Download Attached Submission File
              </a>
            )}

            <form onSubmit={handleGradeSubmission} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Marks (Max: {gradingSubmission.assignment?.totalMarks || 100})</label>
                <Input 
                  type="number" 
                  required 
                  max={gradingSubmission.assignment?.totalMarks || 100}
                  value={gradeForm.marks} 
                  onChange={e => setGradeForm(prev => ({ ...prev, marks: e.target.value }))} 
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Feedback Remarks</label>
                <textarea 
                  className="input min-h-20"
                  value={gradeForm.feedback} 
                  onChange={e => setGradeForm(prev => ({ ...prev, feedback: e.target.value }))} 
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setGradingSubmission(null)}>Cancel</Button>
                <Button type="submit">Submit Grade</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Tabs Menu */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex gap-4 overflow-x-auto">
        {['overview', 'materials', 'assignments', 'quizzes', 'people'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 px-1 text-sm font-semibold border-b-2 capitalize transition-all whitespace-nowrap ${
              activeTab === tab 
                ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white' 
                : 'border-transparent text-slate-450 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        {/* OVERVIEW PANEL */}
        {activeTab === 'overview' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {/* Announcements Posting for teacher */}
              {isTeacher && (
                <Card>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white mb-3">Post Announcement</h3>
                  <form onSubmit={handlePostAnnouncement} className="flex gap-2">
                    <Input 
                      placeholder="Share updates with the class..." 
                      value={newAnnouncement}
                      onChange={e => setNewAnnouncement(e.target.value)}
                    />
                    <Button type="submit">Post</Button>
                  </form>
                </Card>
              )}

              {/* Announcements List */}
              <Card>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Announcements</h3>
                <div className="space-y-4">
                  {(course.announcements || []).length ? (
                    course.announcements.slice().reverse().map((a, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex gap-3 items-start bg-slate-50/50 dark:bg-slate-850/20">
                        <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400 shrink-0">
                          <Megaphone className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-800 dark:text-slate-200">{a.message}</p>
                          <span className="mt-1 block text-[10px] text-slate-400">
                            {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'Just now'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 py-4 text-center">No announcements posted yet.</p>
                  )}
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Course Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-400">Code</span>
                    <span className="font-semibold">{course.code}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-400">Department</span>
                    <span className="font-semibold">{course.department?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-400">Semester</span>
                    <span className="font-semibold">Semester {course.semester}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Credits</span>
                    <span className="font-semibold">{course.credits} Credits</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* MATERIALS PANEL */}
        {activeTab === 'materials' && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Materials List */}
            <div className="lg:col-span-2 space-y-4">
              {(course.materials || []).length ? (
                course.materials.map(m => (
                  <Card key={m._id} className="flex items-center justify-between p-4 hover:border-slate-350 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-500 shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-slate-800 dark:text-white">{m.title}</h4>
                        <span className="text-xs text-slate-400 uppercase font-mono">{m.type}</span>
                      </div>
                    </div>
                    {m.fileUrl || m.externalUrl ? (
                      <a 
                        href={m.fileUrl ? `${api.defaults.baseURL.replace('/api', '')}${m.fileUrl}` : m.externalUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    ) : null}
                  </Card>
                ))
              ) : (
                <p className="text-sm text-slate-500 py-10 text-center">No study materials uploaded yet.</p>
              )}
            </div>

            {/* Upload form for teacher */}
            {isTeacher && (
              <Card className="h-fit">
                <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">Add Study Material</h3>
                <form onSubmit={handleAddMaterial} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Title</label>
                    <Input 
                      required
                      placeholder="Lecture notes..." 
                      value={newMaterial.title}
                      onChange={e => setNewMaterial(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Format Type</label>
                    <select 
                      className="input"
                      value={newMaterial.type}
                      onChange={e => setNewMaterial(prev => ({ ...prev, type: e.target.value }))}
                    >
                      <option value="pdf">PDF Document</option>
                      <option value="ppt">Powerpoint Slide</option>
                      <option value="doc">Word Doc</option>
                      <option value="video">Lecturer Video</option>
                      <option value="link">Web link</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">External Link / URL</label>
                    <Input 
                      placeholder="https://example.com/slide" 
                      value={newMaterial.externalUrl}
                      onChange={e => setNewMaterial(prev => ({ ...prev, externalUrl: e.target.value }))}
                    />
                  </div>
                  <Button type="submit" className="w-full">Upload Material</Button>
                </form>
              </Card>
            )}
          </div>
        )}

        {/* ASSIGNMENTS PANEL */}
        {activeTab === 'assignments' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {assignments.length ? (
                assignments.map(a => {
                  const studentSub = submissions.find(s => s.assignment?._id === a._id);
                  const isOverdue = new Date() > new Date(a.dueDate) && !studentSub;
                  
                  return (
                    <Card key={a._id} className="space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h4 className="font-bold text-lg text-slate-900 dark:text-white">{a.title}</h4>
                          <span className="text-xs text-slate-400 block mt-1">Due: {new Date(a.dueDate).toLocaleString()}</span>
                        </div>
                        <span className="text-xs font-semibold text-slate-500 bg-slate-55 dark:bg-slate-800 px-3 py-1 rounded-full">
                          Max Marks: {a.totalMarks}
                        </span>
                      </div>
                      
                      <p className="text-sm text-slate-650 dark:text-slate-400">{a.description}</p>
                      
                      {/* Grading details for students */}
                      {!isTeacher && studentSub && (
                        <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/10 space-y-2">
                          <div className="flex justify-between items-center text-sm font-semibold">
                            <span className="text-slate-500">Submission Status</span>
                            {studentSub.status === 'graded' ? (
                              <span className="text-emerald-600 dark:text-emerald-500 flex items-center gap-1">
                                <CheckCircle2 className="h-4 w-4" /> Graded ({studentSub.marks} / {a.totalMarks})
                              </span>
                            ) : (
                              <span className="text-amber-600 dark:text-amber-500">Submitted</span>
                            )}
                          </div>
                          {studentSub.feedback && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                              <strong>Teacher remarks:</strong> {studentSub.feedback}
                            </p>
                          )}
                        </div>
                      )}

                      {/* submission status warning */}
                      {!isTeacher && isOverdue && (
                        <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-500 font-semibold bg-rose-50 dark:bg-rose-950/20 p-3 rounded-xl border border-rose-100 dark:border-rose-900/30">
                          <AlertCircle className="h-4 w-4" />
                          <span>Overdue! Please submit immediately to avoid grade deduction.</span>
                        </div>
                      )}

                      {/* File upload zone for student if not submitted */}
                      {!isTeacher && !studentSub && (
                        <div className="space-y-3 pt-2">
                          <textarea 
                            className="input min-h-16" 
                            placeholder="Add assignment summary text note..." 
                            value={submissionText}
                            onChange={e => setSubmissionText(e.target.value)}
                          />
                          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                            <label className="flex items-center gap-2 cursor-pointer border border-dashed border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/20 px-4 py-2.5 rounded-xl text-sm justify-center">
                              <Upload className="h-4 w-4 text-slate-450" />
                              <span className="text-slate-550 dark:text-slate-400 font-semibold">
                                {selectedFile ? selectedFile.name : 'Attach upload file'}
                              </span>
                              <input 
                                type="file" 
                                className="hidden" 
                                onChange={handleFileUpload} 
                              />
                            </label>
                            <Button 
                              disabled={uploading} 
                              onClick={() => handleAssignmentSubmit(a._id)}
                            >
                              {uploading ? 'Submitting...' : 'Submit coursework'}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Submission listing for Teacher */}
                      {isTeacher && (
                        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                          <h5 className="font-bold text-xs text-slate-400 uppercase tracking-widest">Student Submissions</h5>
                          <div className="space-y-2">
                            {submissions.filter(sub => sub.assignment?._id === a._id).length ? (
                              submissions.filter(sub => sub.assignment?._id === a._id).map(sub => (
                                <div key={sub._id} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/10">
                                  <div>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-white">{sub.student?.name}</p>
                                    <span className="text-[10px] text-slate-400">
                                      Submitted: {new Date(sub.submittedAt).toLocaleDateString()} {sub.isLate && <span className="text-rose-500 font-bold ml-1">(LATE)</span>}
                                    </span>
                                  </div>
                                  <div className="flex gap-2">
                                    {sub.status === 'graded' ? (
                                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-900/30">
                                        {sub.marks} / {a.totalMarks}
                                      </span>
                                    ) : (
                                      <Button 
                                        onClick={() => {
                                          setGradingSubmission(sub);
                                          setGradeForm({ marks: '', feedback: '' });
                                        }}
                                        className="text-xs py-1.5 px-3"
                                      >
                                        Grade Task
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-slate-500 py-1 italic">No submissions received yet.</p>
                            )}
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })
              ) : (
                <p className="text-sm text-slate-500 py-10 text-center">No assignments published for this course.</p>
              )}
            </div>

            {/* Create assignment for teacher */}
            {isTeacher && (
              <Card className="h-fit">
                <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4 font-black">Publish Coursework</h3>
                <form onSubmit={handleCreateAssignment} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block font-bold">Assignment Title</label>
                    <Input 
                      required
                      placeholder="React labs 1..." 
                      value={newAssignment.title}
                      onChange={e => setNewAssignment(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block font-bold">Details & Instruction</label>
                    <textarea 
                      required
                      className="input min-h-24"
                      placeholder="Describe steps..."
                      value={newAssignment.description}
                      onChange={e => setNewAssignment(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block font-bold">Max Score</label>
                      <Input 
                        type="number"
                        required
                        value={newAssignment.totalMarks}
                        onChange={e => setNewAssignment(prev => ({ ...prev, totalMarks: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block font-bold">Due Deadline</label>
                      <Input 
                        type="datetime-local"
                        required
                        value={newAssignment.dueDate}
                        onChange={e => setNewAssignment(prev => ({ ...prev, dueDate: e.target.value }))}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">Publish Assignment</Button>
                </form>
              </Card>
            )}
          </div>
        )}

        {/* QUIZZES PANEL */}
        {activeTab === 'quizzes' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {quizzes.length ? (
                quizzes.map(q => {
                  const userAttempt = attempts.find(att => att.quiz?._id === q._id);
                  
                  return (
                    <Card key={q._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 gap-4">
                      <div className="space-y-1">
                        <h4 className="font-bold text-lg text-slate-900 dark:text-white">{q.title}</h4>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 font-medium">
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {q.durationMinutes} mins</span>
                          <span>{q.questions?.length} Questions</span>
                          <span>Pass: {q.passPercentage}%</span>
                        </div>
                      </div>

                      <div className="shrink-0 w-full sm:w-auto">
                        {/* Student Attempt Status */}
                        {!isTeacher && userAttempt ? (
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                              userAttempt.passed 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' 
                                : 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'
                            }`}>
                              {userAttempt.passed ? 'PASSED' : 'FAILED'} ({Math.round(userAttempt.percentage)}%)
                            </span>
                          </div>
                        ) : !isTeacher ? (
                          <Button onClick={() => startQuizAttempt(q)} className="w-full sm:w-auto">
                            Start Quiz
                          </Button>
                        ) : (
                          // Teacher stats
                          <span className="text-xs font-semibold text-slate-500 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-800">
                            Attempts: {attempts.filter(att => att.quiz?._id === q._id).length}
                          </span>
                        )}
                      </div>
                    </Card>
                  );
                })
              ) : (
                <p className="text-sm text-slate-500 py-10 text-center">No quizzes created for this course.</p>
              )}
            </div>

            {/* Quiz builder for teacher */}
            {isTeacher && (
              <Card className="h-fit">
                <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4 font-black">Quiz Builder</h3>
                <form onSubmit={handleCreateQuiz} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Quiz Title</label>
                    <Input 
                      required
                      placeholder="Midterm MCQ..." 
                      value={newQuiz.title}
                      onChange={e => setNewQuiz(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Duration (Mins)</label>
                      <Input 
                        type="number"
                        required
                        value={newQuiz.durationMinutes}
                        onChange={e => setNewQuiz(prev => ({ ...prev, durationMinutes: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Pass Percentage</label>
                      <Input 
                        type="number"
                        required
                        value={newQuiz.passPercentage}
                        onChange={e => setNewQuiz(prev => ({ ...prev, passPercentage: Number(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-150 dark:border-slate-850 pt-3 space-y-3">
                    <h5 className="font-bold text-xs text-slate-450 uppercase tracking-wider">Question details</h5>
                    <Input 
                      required
                      placeholder="What is state in React?" 
                      value={newQuiz.questions[0].question}
                      onChange={e => {
                        const qs = [...newQuiz.questions];
                        qs[0].question = e.target.value;
                        setNewQuiz(prev => ({ ...prev, questions: qs }));
                      }}
                    />
                    
                    {newQuiz.questions[0].options.map((opt, oIdx) => (
                      <Input 
                        key={oIdx}
                        required
                        placeholder={`Option ${oIdx + 1}`} 
                        value={opt}
                        onChange={e => {
                          const qs = [...newQuiz.questions];
                          qs[0].options[oIdx] = e.target.value;
                          setNewQuiz(prev => ({ ...prev, questions: qs }));
                        }}
                      />
                    ))}

                    <div>
                      <label className="text-xs font-semibold text-slate-450 uppercase tracking-wider mb-1 block">Correct Option (0-3)</label>
                      <Input 
                        type="number"
                        required
                        min={0}
                        max={3}
                        value={newQuiz.questions[0].correctAnswer}
                        onChange={e => {
                          const qs = [...newQuiz.questions];
                          qs[0].correctAnswer = Number(e.target.value);
                          setNewQuiz(prev => ({ ...prev, questions: qs }));
                        }}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full">Publish Quiz</Button>
                </form>
              </Card>
            )}
          </div>
        )}

        {/* PEOPLE PANEL */}
        {activeTab === 'people' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-slate-400" /> Enrolled Students
                  </h3>
                  <span className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-slate-500 px-3 py-1 rounded-full">
                    {enrollments.length} Total
                  </span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {enrollments.length ? (
                    enrollments.map(e => (
                      <div key={e._id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-white">{e.student?.name}</p>
                          <p className="text-xs text-slate-400">{e.student?.email}</p>
                        </div>
                        <span className="text-xs text-slate-400 font-mono capitalize">
                          {e.student?.department?.name || 'LMS Student'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 py-6 text-center">No students enrolled yet.</p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
