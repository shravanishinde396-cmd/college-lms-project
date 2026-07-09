import { useEffect, useState } from 'react';
import api from '../../../api/axios';
import PageHeader from '../../../components/common/PageHeader';
import SectionMessage from '../../../components/common/SectionMessage';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

export default function ManageDepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ name: '', code: '', description: '' });
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setError('');
      const { data } = await api.get('/departments');
      setDepartments(data.departments || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load departments.');
      setDepartments([]);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await api.post('/departments', form);
      setForm({ name:'', code:'', description:'' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create department.');
    }
  };

  return <div><PageHeader title="Departments" subtitle="Create and manage academic departments." />{error ? <SectionMessage title="Departments issue" message={error} tone="error" /> : null}<div className="grid gap-6 lg:grid-cols-[380px,1fr]"><Card><form onSubmit={submit} className="space-y-3"><Input placeholder="Department name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /><Input placeholder="Code" value={form.code} onChange={e=>setForm({...form,code:e.target.value})} /><Input placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} /><Button>Create</Button></form></Card><Card>{departments.length ? departments.map(d => <div key={d._id} className="border-b py-3"><p className="font-semibold">{d.name} ({d.code})</p><p className="text-sm text-slate-500">{d.description}</p></div>) : <p className="text-sm text-slate-500">No departments added yet.</p>}</Card></div></div>;
}
