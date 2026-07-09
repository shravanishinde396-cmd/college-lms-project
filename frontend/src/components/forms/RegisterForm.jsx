import { useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '../ui/Input';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'faculty', 'admin']),
  department: z.string().optional(),
  semester: z.preprocess((val) => (val === '' || val === undefined) ? undefined : Number(val), z.number().min(1).max(8).optional())
}).superRefine((data, ctx) => {
  if (data.role !== 'admin' && !data.department) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Department is required',
      path: ['department']
    });
  }
});

export default function RegisterForm({ onSubmit, loading, error, departments = [] }) {
  const { register, watch, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { role: 'student', semester: 1 },
    resolver: zodResolver(registerSchema),
  });
  
  const role = watch('role');
  const canChooseDepartment = role !== 'admin';

  const helperText = useMemo(() => {
    if (role === 'admin') return 'Create an admin account with your own email.';
    if (role === 'faculty') return 'Faculty can sign in with any email. Courses are assigned later by admin or created by the faculty.';
    return 'Students need a department so their dashboard data is linked correctly.';
  }, [role]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input placeholder="Full name" error={errors.name} {...register('name')} />
      </div>
      <div>
        <Input placeholder="Email" error={errors.email} {...register('email')} />
      </div>
      <div>
        <Input type="password" placeholder="Password" error={errors.password} {...register('password')} />
      </div>
      <div>
        <select className="input" {...register('role')}>
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {canChooseDepartment && (
        <div>
          <select 
            className={`input ${errors.department ? 'border-red-500 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-950/30' : ''}`} 
            {...register('department')}
          >
            <option value="">Select Department</option>
            {departments.map((department) => (
              <option key={department._id} value={department._id}>{department.name}</option>
            ))}
          </select>
          {errors.department && (
            <span className="mt-1 block text-xs text-red-500">{errors.department.message}</span>
          )}
        </div>
      )}

      {role === 'student' && (
        <div>
          <Input type="number" placeholder="Semester" error={errors.semester} {...register('semester')} />
        </div>
      )}

      <p className="text-sm text-slate-500 dark:text-slate-400">{helperText}</p>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creating account...' : 'Register'}
      </Button>
    </form>
  );
}
