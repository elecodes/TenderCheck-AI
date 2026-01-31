import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLoginButton } from './GoogleLoginButton';

const loginSchema = z.object({
  email: z.string().email({ message: 'Por favor introduce un email válido' }),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Se requiere una mayúscula')
    .regex(/\d/, 'Se requiere un número')
    .regex(/[^a-zA-Z0-9]/, 'Se requiere un carácter especial'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth(); // Use context hook
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enableGoogle = import.meta.env.VITE_ENABLE_GOOGLE_AUTH === 'true';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch {
      // Security: Always return generic error
      setError('Credenciales inválidas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-300">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-serif text-white tracking-tight">Bienvenido de nuevo</h1>
        <p className="text-emerald-100/60 font-light">TenderCheck AI Enterprise</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div role="alert" className="p-3 bg-red-500/10 border border-red-500/20 text-red-200 text-sm rounded-lg flex items-center gap-2">
             <span className="font-semibold">Error:</span> {error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="block text-xs font-medium uppercase tracking-widest text-emerald-100/50">
            Correo Electrónico
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-100/30 group-focus-within:text-emerald-400 transition-colors">
              <Mail className="h-5 w-5" />
            </div>
            <input
              id="email"
              type="email"
              autoFocus
              placeholder="name@company.com"
              className={`block w-full pl-10 pr-3 py-3 bg-white/5 border ${errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-emerald-400'} rounded-lg text-base text-emerald-50 placeholder-emerald-100/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all`}
              aria-invalid={errors.email ? 'true' : 'false'}
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p role="alert" className="text-xs text-red-300 mt-1 flex items-center gap-1 animate-in slide-in-from-top-1">
              • {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-xs font-medium uppercase tracking-widest text-emerald-100/50">
              Contraseña
            </label>
            <Link to="/forgot-password" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">¿Olvidaste tu contraseña?</Link>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-100/30 group-focus-within:text-emerald-400 transition-colors">
              <Lock className="h-5 w-5" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={`block w-full pl-10 pr-10 py-3 bg-white/5 border ${errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-emerald-400'} rounded-lg text-base text-emerald-50 placeholder-emerald-100/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all`}
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
          {errors.password && (
            <p role="alert" className="text-xs text-red-300 mt-1 flex items-center gap-1 animate-in slide-in-from-top-1">
              • {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
               <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
               Iniciando sesión...
            </div>
          ) : (
            <div className="flex items-center gap-2">
               Iniciar Sesión <ArrowRight className="h-4 w-4" />
            </div>
          )}
        </button>
      </form>
      
      {enableGoogle && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
             <div className="h-px flex-1 bg-emerald-100/10"></div>
             <span className="text-xs text-emerald-100/30 uppercase">O</span>
             <div className="h-px flex-1 bg-emerald-100/10"></div>
          </div>
          <GoogleLoginButton />
        </div>
      )}
      
      <div className="text-center text-sm">
        <span className="text-emerald-100/40">¿No tienes una cuenta? </span>
        <Link to="/register" className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
          Crear Cuenta
        </Link>
      </div>
    </div>
  );
}
