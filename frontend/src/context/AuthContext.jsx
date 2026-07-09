import { createContext, useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [loading, setLoading] = useState(false);

  const login = async (values) => {
    setLoading(true);
    try {
      const { email, password, rememberMe } = values;
      const { data } = await api.post('/auth/login', { email, password });
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      toast.success(`Welcome back, ${data.user.name}!`);
      return { ok: true, user: data.user };
    } catch (error) {
      return { ok: false, message: error.response?.data?.message || 'Login failed' };
    } finally { setLoading(false); }
  };

  const register = async (values) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', values);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      toast.success('Registration successful!');
      return { ok: true, user: data.user };
    } catch (error) {
      return { ok: false, message: error.response?.data?.message || 'Register failed' };
    } finally { setLoading(false); }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error on server:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      toast.success('Logged out successfully.');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    api.get('/auth/me').then(({ data }) => {
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
    }).catch(() => {
      // In case /me fails (e.g. token expired/invalid, let interceptor handle it, or log out)
      logout();
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
