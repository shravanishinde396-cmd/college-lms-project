import { useEffect, useState } from 'react';
import api from '../../../api/axios';
import PageHeader from '../../../components/common/PageHeader';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
export default function TeacherAssignmentsPage() {
  const [courses, setCourses] = useState([]); const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState({ title:'', description:'', course:'', dueDate:'', totalMarks:100 });
  const fetchAll = async () => {
    const [courseRes, assRes] = await Promise.all([api.get('/courses/my-courses'), api.get('/assignments')]);
    setCourses(courseRes.data.courses); setAssignments(assRes.data.assignments);
  };
  useEffect(()=>{ fetchAll(); }, []);
  const submit = async (e) => { e.preventDefault(); await api.post('/assignments', form); fetchAll(); };
  return <div><PageHeader title="Assignments" subtitle="Publish and monitor coursework." /><div className="grid gap-6 lg:grid-cols-[420px,1fr]"><Card><form onSubmit={submit} className="space-y-3"><Input placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} /><textarea className="input min-h-28" placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} /><select className="input" value={form.course} onChange={e=>setForm({...form,course:e.target.value})}>{courses.map(c=><option key={c._id} value={c._id}>{c.title}</option>)}</select><Input type="datetime-local" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})} /><Input type="number" value={form.totalMarks} onChange={e=>setForm({...form,totalMarks:e.target.value})} /><Button>Create Assignment</Button></form></Card><Card>{assignments.map(a => <div key={a._id} className="border-b py-3"><p className="font-semibold">{a.title}</p><p className="text-sm text-slate-500">{a.course?.title} • Due {new Date(a.dueDate).toLocaleString()}</p></div>)}</Card></div></div>;
}
