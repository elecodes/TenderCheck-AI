import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const forgotPasswordSchema = z.object({
  email: z.string().email('Por favor introduce un email válido'),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const { requestPasswordReset } = useAuth(); // We'll add this to AuthContext
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: ForgotPasswordData) => {
    setIsLoading(true);
    setError(null);
    try {
      await requestPasswordReset(data.email);
      setIsSuccess(true);
    } catch (err: unknown) {
      // Security: Generic message
      setError('Si el email existe, se enviaron instrucciones.'); 
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md p-8 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-300 text-center">
        <div className="mx-auto w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-serif text-white tracking-tight mb-4">¡Correo Enviado!</h1>
        <p className="text-emerald-100/60 font-light mb-8">
          Hemos enviado instrucciones para restablecer tu contraseña a tu correo electrónico. Por favor revisa tu bandeja de entrada (y spam).
        </p>
        <Link 
          to="/login"
          className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors font-medium text-sm tracking-wide"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-300">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-serif text-white tracking-tight">Recuperar Contraseña</h1>
        <p className="text-emerald-100/60 font-light">Introduce tu email para recibir instrucciones</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div role="alert" className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm rounded-lg flex items-center gap-2">
             <span className="font-semibold">Info:</span> {error}
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
              placeholder="nombre@empresa.com"
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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
               <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
               Enviando...
            </div>
          ) : (
            <div className="flex items-center gap-2">
               Enviar Instrucciones <ArrowRight className="h-4 w-4" />
            </div>
          )}
        </button>
      </form>
      
      <div className="text-center text-sm">
        <Link to="/login" className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors flex items-center justify-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Volver al Inicio de Sesión
        </Link>
      </div>
    </div>
  );
}
