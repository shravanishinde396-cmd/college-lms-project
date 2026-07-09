import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  useEffect(() => { api.get('/courses').then(({ data }) => setCourses(data.courses)); }, []);
  return <div className="mx-auto max-w-7xl px-6 py-16"><h1 className="text-4xl font-bold">Programs & Courses</h1><div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{courses.map(c => <Card key={c._id}><p className="text-sm text-slate-500">{c.code}</p><h3 className="mt-2 text-xl font-semibold">{c.title}</h3><p className="mt-2 text-slate-600">{c.description}</p><p className="mt-4 text-sm">Semester {c.semester} • {c.credits} credits</p></Card>)}</div></div>;
}
