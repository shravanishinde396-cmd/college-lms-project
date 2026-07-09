import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

export default function LoginForm({ onSubmit, loading, error }) {
  const rememberedEmail = localStorage.getItem('rememberedEmail') || '';
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: rememberedEmail,
      rememberMe: !!rememberedEmail,
    }
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input 
          type="email" 
          placeholder="Email Address" 
          error={errors.email} 
          {...register('email')} 
        />
      </div>
      <div>
        <Input 
          type="password" 
          placeholder="Password" 
          error={errors.password} 
          {...register('password')} 
        />
      </div>
      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input 
            type="checkbox" 
            className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-white dark:focus:ring-offset-slate-950" 
            {...register('rememberMe')} 
          />
          <span>Remember me</span>
        </label>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Please wait...' : 'Login'}
      </Button>
    </form>
  );
}
