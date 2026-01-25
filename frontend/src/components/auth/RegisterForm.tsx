import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { register as registerApi } from '../../services/auth.service';
import { Eye, EyeOff, Lock, Mail, User, Building, ArrowRight } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid work email'),
  company: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess: () => void;
  onGoToLogin: () => void;
}

export function RegisterForm({ onSuccess, onGoToLogin }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await registerApi(data.name, data.email, data.password, data.company);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-right-10 duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-serif text-white tracking-tight">Create Account</h1>
        <p className="text-emerald-100/60 font-light">Join the elite standard in public tender analysis</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {error && (
            <div role="alert" className="p-3 bg-red-500/10 border border-red-500/20 text-red-200 text-sm rounded-lg flex items-center gap-2">
                <span className="font-semibold">Error:</span> {error}
            </div>
        )}

        <div className="space-y-2">
          <label htmlFor="name" className="block text-xs font-medium uppercase tracking-widest text-emerald-100/50">
            Full Name
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-100/30 group-focus-within:text-emerald-400 transition-colors">
              <User className="h-5 w-5" />
            </div>
            <input
              id="name"
              type="text"
              placeholder="e.g. Julian Sterling"
              className={`block w-full pl-10 pr-3 py-3 bg-white/5 border ${errors.name ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-emerald-500'} rounded-lg text-emerald-50 placeholder-emerald-100/20 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all`}
              aria-invalid={errors.name ? 'true' : 'false'}
              {...register('name')}
            />
          </div>
          {errors.name && <p className="text-xs text-red-300 mt-1">• {errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-xs font-medium uppercase tracking-widest text-emerald-100/50">
            Work Email
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-100/30 group-focus-within:text-emerald-400 transition-colors">
              <Mail className="h-5 w-5" />
            </div>
            <input
              id="email"
              type="email"
              placeholder="name@company.com"
              className={`block w-full pl-10 pr-3 py-3 bg-white/5 border ${errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-emerald-500'} rounded-lg text-emerald-50 placeholder-emerald-100/20 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all`}
              aria-invalid={errors.email ? 'true' : 'false'}
              {...register('email')}
            />
          </div>
          {errors.email && <p className="text-xs text-red-300 mt-1">• {errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="company" className="block text-xs font-medium uppercase tracking-widest text-emerald-100/50">
            Company (Optional)
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-100/30 group-focus-within:text-emerald-400 transition-colors">
              <Building className="h-5 w-5" />
            </div>
            <input
              id="company"
              type="text"
              placeholder="Organization Name"
              className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-lg text-emerald-50 placeholder-emerald-100/20 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
              {...register('company')}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-xs font-medium uppercase tracking-widest text-emerald-100/50">
            Password
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-100/30 group-focus-within:text-emerald-400 transition-colors">
              <Lock className="h-5 w-5" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={`block w-full pl-10 pr-10 py-3 bg-white/5 border ${errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-emerald-500'} rounded-lg text-emerald-50 placeholder-emerald-100/20 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all`}
              placeholder="••••••••"
              aria-invalid={errors.password ? 'true' : 'false'}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-emerald-100/30 hover:text-emerald-100 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-300 mt-1">• {errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
        >
          {isLoading ? (
             <div className="flex items-center gap-2">
               <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
               Creating Account...
             </div>
          ) : (
            <div className="flex items-center gap-2">
              Create Account <ArrowRight className="h-4 w-4" />
            </div>
          )}
        </button>
      </form>
      
      <div className="text-center text-sm">
        <span className="text-emerald-100/40">Already have an account? </span>
        <button onClick={onGoToLogin} className="font-medium text-amber-500 hover:text-amber-400 transition-colors">
          Log in
        </button>
      </div>
    </div>
  );
}
