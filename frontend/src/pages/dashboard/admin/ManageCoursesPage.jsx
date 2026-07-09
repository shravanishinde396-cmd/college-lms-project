import { useEffect, useState } from 'react';
import api from '../../../api/axios';
import PageHeader from '../../../components/common/PageHeader';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

export default function ManageCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ title:'', code:'', description:'', teacher:'', department:'', semester:1, credits:3 });

  const load = async () => {
    const [courseRes, facultyRes, deptRes] = await Promise.all([
      api.get('/courses'),
      api.get('/users?role=faculty'),
      api.get('/departments')
    ]);
    setCourses(courseRes.data.courses || []);
    setFaculty(facultyRes.data.users || []);
    setDepartments(deptRes.data.departments || []);
  };

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    await api.post('/courses', form);
    setForm({ title:'', code:'', description:'', teacher:'', department:'', semester:1, credits:3 });
    load();
  };

  const assignFaculty = async (courseId, teacherId) => {
    await api.put(`/courses/${courseId}`, { teacher: teacherId });
    load();
  };

  return <div><PageHeader title="Manage Courses / Subjects" subtitle="Admin can create courses and assign them to any faculty email." /><div className="grid gap-6 lg:grid-cols-[380px,1fr]"><Card><form onSubmit={create} className="space-y-3"><Input placeholder="Course title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} /><Input placeholder="Code" value={form.code} onChange={e=>setForm({...form,code:e.target.value})} /><textarea className="input min-h-24" placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} /><select className="input" value={form.department} onChange={e=>setForm({...form,department:e.target.value})}><option value="">Select department</option>{departments.map(d=><option key={d._id} value={d._id}>{d.name}</option>)}</select><select className="input" value={form.teacher} onChange={e=>setForm({...form,teacher:e.target.value})}><option value="">Assign faculty</option>{faculty.map(f=><option key={f._id} value={f._id}>{f.name} ({f.email})</option>)}</select><Input type="number" placeholder="Semester" value={form.semester} onChange={e=>setForm({...form,semester:e.target.value})} /><Input type="number" placeholder="Credits" value={form.credits} onChange={e=>setForm({...form,credits:e.target.value})} /><Button>Create Course</Button></form></Card><Card><div className="space-y-3">{courses.map(course => <div key={course._id} className="rounded-xl border p-4"><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div><p className="font-semibold">{course.title}</p><p className="text-sm text-slate-500">{course.code} • {course.department?.name || '-'} • Semester {course.semester}</p></div><select className="input w-full lg:w-80" value={course.teacher?._id || ''} onChange={e=>assignFaculty(course._id, e.target.value)}><option value="">Assign faculty</option>{faculty.map(f=><option key={f._id} value={f._id}>{f.name}</option>)}</select></div></div>)}</div></Card></div></div>;
}
