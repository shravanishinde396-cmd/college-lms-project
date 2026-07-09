import { useEffect, useState } from 'react';
import api from '../../../api/axios';
import PageHeader from '../../../components/common/PageHeader';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
export default function ManageTimetablePage() {
  const [entries, setEntries] = useState([]); const [courses, setCourses] = useState([]); const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ course:'', department:'', semester:1, day:'Monday', startTime:'10:00', endTime:'11:00', room:'A101' });
  const fetchAll = async () => {
    const [tt, cs, ds] = await Promise.all([api.get('/timetable'), api.get('/courses'), api.get('/departments')]);
    setEntries(tt.data.entries); setCourses(cs.data.courses); setDepartments(ds.data.departments);
  };
  useEffect(()=>{ fetchAll(); }, []);
  const submit = async (e) => { e.preventDefault(); await api.post('/timetable', form); fetchAll(); };
  return <div><PageHeader title="Timetable" subtitle="Create timetable entries for each semester." /><div className="grid gap-6 lg:grid-cols-[420px,1fr]"><Card><form onSubmit={submit} className="space-y-3"><select className="input" value={form.course} onChange={e=>setForm({...form,course:e.target.value})}>{courses.map(c=><option key={c._id} value={c._id}>{c.title}</option>)}</select><select className="input" value={form.department} onChange={e=>setForm({...form,department:e.target.value})}>{departments.map(d=><option key={d._id} value={d._id}>{d.name}</option>)}</select><Input type="number" value={form.semester} onChange={e=>setForm({...form,semester:e.target.value})} /><Input value={form.day} onChange={e=>setForm({...form,day:e.target.value})} /><Input value={form.startTime} onChange={e=>setForm({...form,startTime:e.target.value})} /><Input value={form.endTime} onChange={e=>setForm({...form,endTime:e.target.value})} /><Input value={form.room} onChange={e=>setForm({...form,room:e.target.value})} /><Button>Create Entry</Button></form></Card><Card>{entries.map(e => <div key={e._id} className="border-b py-3"><p className="font-semibold">{e.day} • {e.startTime}-{e.endTime}</p><p className="text-sm text-slate-500">{e.course?.title} • Room {e.room}</p></div>)}</Card></div></div>;
}
