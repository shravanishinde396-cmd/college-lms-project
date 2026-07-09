import { useEffect, useState } from 'react';
import api from '../../../api/axios';
import PageHeader from '../../../components/common/PageHeader';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

export default function TeacherCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ title:'', code:'', description:'', department:'', semester:1, credits:3 });
  const fetchAll = async () => {
    const [cRes, dRes] = await Promise.all([api.get('/courses/my-courses'), api.get('/departments')]);
    setCourses(cRes.data.courses || []);
    setDepartments(dRes.data.departments || []);
  };
  useEffect(()=>{ fetchAll(); }, []);
  const submit = async (e) => {
    e.preventDefault();
    await api.post('/courses', form);
    setForm({ title:'', code:'', description:'', department:'', semester:1, credits:3 });
    fetchAll();
  };
  return <div><PageHeader title="My Subjects / Courses" subtitle="Create and manage courses assigned to your faculty account." /><div className="grid gap-6 lg:grid-cols-[420px,1fr]"><Card><form onSubmit={submit} className="space-y-3"><Input placeholder="Course title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} /><Input placeholder="Course code" value={form.code} onChange={e=>setForm({...form,code:e.target.value})} /><textarea className="input min-h-28" placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} /><select className="input" value={form.department} onChange={e=>setForm({...form,department:e.target.value})}><option value="">Select department</option>{departments.map(d=><option key={d._id} value={d._id}>{d.name}</option>)}</select><Input type="number" placeholder="Semester" value={form.semester} onChange={e=>setForm({...form,semester:e.target.value})} /><Input type="number" placeholder="Credits" value={form.credits} onChange={e=>setForm({...form,credits:e.target.value})} /><Button>Create Course</Button></form></Card><Card>{courses.length ? courses.map(c => <div key={c._id} className="border-b py-3"><p className="font-semibold">{c.title}</p><p className="text-sm text-slate-500">{c.code} • Semester {c.semester}</p></div>) : <p className="text-slate-500">No courses assigned yet. Admin can assign one or you can create one here.</p>}</Card></div></div>;
}
