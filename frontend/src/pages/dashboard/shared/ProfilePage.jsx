import { useState } from 'react';
import api from '../../../api/axios';
import useAuth from '../../../hooks/useAuth';
import PageHeader from '../../../components/common/PageHeader';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const save = async () => {
    const { data } = await api.put('/users/profile', { name });
    setUser(data.user); localStorage.setItem('user', JSON.stringify(data.user));
    alert('Profile updated');
  };
  return <div><PageHeader title="Profile" subtitle="Update your basic information." /><Card className="max-w-xl"><label className="mb-2 block text-sm">Full Name</label><Input value={name} onChange={(e)=>setName(e.target.value)} /><Button className="mt-4" onClick={save}>Save changes</Button></Card></div>;
}
