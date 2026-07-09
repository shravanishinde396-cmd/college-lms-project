import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../api/axios';
import PageHeader from '../../../components/common/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
export default function StudentCoursesPage() {
  const [courses, setCourses] = useState([]); const [allCourses, setAllCourses] = useState([]);
  const fetchAll = async () => { const [mine, all] = await Promise.all([api.get('/courses/my-courses'), api.get('/courses')]); setCourses(mine.data.courses); setAllCourses(all.data.courses); };
  useEffect(()=>{ fetchAll(); }, []);
  const enrolledIds = new Set(courses.map(c => c._id));
  const enroll = async (id) => { await api.post(`/courses/${id}/enroll`); fetchAll(); };
  return <div><PageHeader title="Courses" subtitle="Browse your enrolled courses and discover more." /><h2 className="mb-3 mt-6 text-xl font-semibold">My Courses</h2><div className="grid gap-4 md:grid-cols-2">{courses.map(c => <Card key={c._id}><h3 className="text-lg font-semibold">{c.title}</h3><p className="mt-2 text-slate-500">{c.description}</p><div className="mt-4 flex gap-3"><Link className="btn-primary" to={`/student/course/${c._id}`}>Open</Link><span className="btn-secondary">{c.progress || 0}% progress</span></div></Card>)}</div><h2 className="mb-3 mt-10 text-xl font-semibold">Available Courses</h2><div className="grid gap-4 md:grid-cols-2">{allCourses.map(c => <Card key={c._id}><h3 className="text-lg font-semibold">{c.title}</h3><p className="text-sm text-slate-500">{c.code}</p><p className="mt-2 text-slate-500">{c.description}</p><Button className="mt-4" onClick={()=>enroll(c._id)} disabled={enrolledIds.has(c._id)}>{enrolledIds.has(c._id) ? 'Enrolled' : 'Enroll'}</Button></Card>)}</div></div>;
}
