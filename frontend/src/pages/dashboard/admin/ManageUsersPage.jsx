import { useEffect, useState } from 'react';
import api from '../../../api/axios';
import PageHeader from '../../../components/common/PageHeader';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

export default function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', department: '', semester: 1 });

  const fetchUsers = async () => {
    const [userRes, deptRes] = await Promise.all([api.get('/users'), api.get('/departments')]);
    setUsers(userRes.data.users || []);
    setDepartments(deptRes.data.departments || []);
  };

  useEffect(() => { fetchUsers(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (payload.role === 'admin') delete payload.department;
    await api.post('/users', payload);
    setForm({ name: '', email: '', password: '', role: 'student', department: '', semester: 1 });
    fetchUsers();
  };

  const remove = async (id) => { await api.delete(`/users/${id}`); fetchUsers(); };

  return <div><PageHeader title="Manage Users" subtitle="Create different admin, faculty, and student accounts with any email." /><div className="grid gap-6 lg:grid-cols-[360px,1fr]"><Card><form onSubmit={submit} className="space-y-3"><Input placeholder="Full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /><Input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /><Input type="password" placeholder="Password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} /><select className="input" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option value="student">Student</option><option value="faculty">Faculty</option><option value="admin">Admin</option></select>{form.role !== 'admin' && <select className="input" value={form.department} onChange={e=>setForm({...form,department:e.target.value})}><option value="">Select department</option>{departments.map(d=><option key={d._id} value={d._id}>{d.name}</option>)}</select>}{form.role === 'student' && <Input type="number" placeholder="Semester" value={form.semester} onChange={e=>setForm({...form,semester:e.target.value})} />}<Button>Create User</Button></form></Card><Card><div className="overflow-auto"><table className="w-full text-left"><thead><tr className="border-b"><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Department</th><th className="p-3">Action</th></tr></thead><tbody>{users.map(u => <tr key={u._id} className="border-b"><td className="p-3">{u.name}</td><td className="p-3">{u.email}</td><td className="p-3 capitalize">{u.role}</td><td className="p-3">{u.department?.name || '-'}</td><td className="p-3"><button className="text-red-500" onClick={()=>remove(u._id)}>Delete</button></td></tr>)}</tbody></table></div></Card></div></div>;
}
