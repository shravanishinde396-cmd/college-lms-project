import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await register(form);
    if (res.ok) {
      const role = res.user.role;
      navigate(role === 'admin' ? '/admin' : role === 'faculty' ? '/faculty' : '/student');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-soft">
        <h1 className="mb-6 text-2xl font-bold">Create Account</h1>
        {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Full Name</label>
            <input className="input" type="text" placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Role</label>
            <select className="input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>
          </div>
          <button className="btn-primary w-full" disabled={loading}>{loading ? 'Creating…' : 'Register'}</button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account? <Link to="/login" className="font-medium text-slate-900 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
