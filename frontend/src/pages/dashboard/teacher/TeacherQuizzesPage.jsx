import { useEffect, useState } from 'react';
import api from '../../../api/axios';
import PageHeader from '../../../components/common/PageHeader';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
export default function TeacherQuizzesPage() {
  const [courses, setCourses] = useState([]); const [quizzes, setQuizzes] = useState([]);
  const [form, setForm] = useState({ title:'', course:'', durationMinutes:20, passPercentage:40, questions:[{ question:'', options:['','','',''], correctAnswer:0, marks:1 }] });
  const fetchAll = async () => {
    const [courseRes, quizRes] = await Promise.all([api.get('/courses/my-courses'), api.get('/quizzes')]);
    setCourses(courseRes.data.courses); setQuizzes(quizRes.data.quizzes);
  };
  useEffect(()=>{ fetchAll(); }, []);
  const submit = async (e) => { e.preventDefault(); await api.post('/quizzes', form); fetchAll(); };
  return <div><PageHeader title="Quizzes" subtitle="Create MCQ tests with auto evaluation." /><div className="grid gap-6 lg:grid-cols-[460px,1fr]"><Card><form onSubmit={submit} className="space-y-3"><Input placeholder="Quiz title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} /><select className="input" value={form.course} onChange={e=>setForm({...form,course:e.target.value})}>{courses.map(c=><option key={c._id} value={c._id}>{c.title}</option>)}</select><Input type="number" value={form.durationMinutes} onChange={e=>setForm({...form,durationMinutes:e.target.value})} /><Input type="number" value={form.passPercentage} onChange={e=>setForm({...form,passPercentage:e.target.value})} /><h4 className="font-semibold">Question 1</h4><Input placeholder="Question" value={form.questions[0].question} onChange={e=>setForm({...form,questions:[{...form.questions[0],question:e.target.value}]})} />{form.questions[0].options.map((op, idx)=><Input key={idx} placeholder={`Option ${idx+1}`} value={op} onChange={e=>{ const options=[...form.questions[0].options]; options[idx]=e.target.value; setForm({...form,questions:[{...form.questions[0],options}]}); }} />)}<Input type="number" placeholder="Correct answer index (0-3)" value={form.questions[0].correctAnswer} onChange={e=>setForm({...form,questions:[{...form.questions[0],correctAnswer:Number(e.target.value)}]})} /><Button>Create Quiz</Button></form></Card><Card>{quizzes.map(q => <div key={q._id} className="border-b py-3"><p className="font-semibold">{q.title}</p><p className="text-sm text-slate-500">{q.course?.title} • {q.questions?.length} questions</p></div>)}</Card></div></div>;
}
