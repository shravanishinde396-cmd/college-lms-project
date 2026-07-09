import { useEffect, useState } from 'react';
import api from '../../../api/axios';
import PageHeader from '../../../components/common/PageHeader';
import SectionMessage from '../../../components/common/SectionMessage';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

export default function ManageNoticesPage() {
  const [notices, setNotices] = useState([]);
  const [form, setForm] = useState({ title:'', message:'', audience:'all' });
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setError('');
      const { data } = await api.get('/notices');
      setNotices(data.notices || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load notices.');
      setNotices([]);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await api.post('/notices', form);
      setForm({ title:'', message:'', audience:'all' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to post notice.');
    }
  };

  return <div><PageHeader title="Notices" subtitle="Post announcements for students and teachers." />{error ? <SectionMessage title="Notices issue" message={error} tone="error" /> : null}<div className="grid gap-6 lg:grid-cols-[420px,1fr]"><Card><form onSubmit={submit} className="space-y-3"><Input placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} /><textarea className="input min-h-32" placeholder="Message" value={form.message} onChange={e=>setForm({...form,message:e.target.value})} /><select className="input" value={form.audience} onChange={e=>setForm({...form,audience:e.target.value})}><option value="all">All</option><option value="students">Students</option><option value="teachers">Teachers</option></select><Button>Post Notice</Button></form></Card><Card>{notices.length ? notices.map(n => <div key={n._id} className="border-b py-3"><p className="font-semibold">{n.title}</p><p className="text-sm text-slate-500">{n.message}</p></div>) : <p className="text-sm text-slate-500">No notices posted yet.</p>}</Card></div></div>;
}
