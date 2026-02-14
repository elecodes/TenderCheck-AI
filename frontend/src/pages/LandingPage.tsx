import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { UploadCloud, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-[#D3D0C2] bg-gradient-to-br from-[#E8E6DE] via-[#D3D0C2] to-[#B8C1B7] dark:bg-[#1a1f24] dark:bg-gradient-to-br dark:from-[#3a4450] dark:via-[#242b33] dark:to-[#1a1f24] text-[#2D312D] dark:text-white overflow-hidden relative font-sans isolation-auto transition-colors duration-500">
      <Navbar />

      {/* Decorative Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none mix-blend-multiply dark:mix-blend-screen animate-float" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-screen animate-float" style={{ animationDelay: '-3s' }} />

      {/* Hero Section */}
      <main className="pt-48 pb-48 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center relative z-10 animate-fade-up">
        
        {/* Hero Content */}

        <h1 className="text-6xl md:text-8xl font-serif font-medium mb-8 leading-[0.9] max-w-5xl text-[#1a1c1a] dark:text-white tracking-tight">
          Precisión en cada <br/> propuesta.
        </h1>
        
        <p className="text-xl md:text-2xl text-[#4A4F4A] dark:text-gray-400 max-w-2xl mb-16 font-sans font-light leading-relaxed">
          Análisis de alta fidelidad para documentos complejos de contratación pública. 
          Sube tus <span className="text-[#C5A028] dark:text-[#D4AF37] font-serif italic">Pliegos</span> para cumplimiento instantáneo.
        </p>

        {/* Central Glass Card */}
        <div className="w-full max-w-md relative group hover-lift">
            {/* Card Background */}
            <div className="absolute -inset-1 bg-gradient-to-b from-[#C5A028]/20 to-emerald-500/20 dark:from-[#D4AF37]/20 dark:to-emerald-500/20 rounded-[35px] blur-2xl opacity-30 group-hover:opacity-50 transition-soft duration-500"></div>
            
            <div className="relative rounded-[32px] bg-white/40 dark:bg-white/[0.03] backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-2xl p-12 flex flex-col items-center gap-8 overflow-hidden transition-soft">
                
                {/* Icon Box */}
                <div className="w-20 h-20 rounded-2xl bg-[#1a1c1a]/5 dark:bg-white/5 shadow-inner flex items-center justify-center mb-2 border border-black/5 dark:border-white/10 transition-soft group-hover:scale-110">
                    <UploadCloud className="w-8 h-8 text-[#C5A028] dark:text-[#D4AF37]" />
                </div>
                
                <div className="text-center space-y-3">
                    <h3 className="font-serif text-3xl text-[#1a1c1a] dark:text-white">Nuevo Análisis</h3>
                    <p className="text-[#4A4F4A] dark:text-gray-400 text-lg leading-snug max-w-[260px]">
                        Sube tus documentos PDF de licitación para verificación de cumplimiento impulsada por IA.
                    </p>
                </div>

                <Link to="/register" className="w-full py-4 rounded-xl bg-[#C5A028] hover:bg-[#B08D20] text-white text-sm font-bold tracking-widest uppercase shadow-xl shadow-[#C5A028]/20 transition-soft active:scale-[0.98] flex items-center justify-center mt-4 group-hover:shadow-2xl group-hover:shadow-[#C5A028]/30 border border-[#C5A028]/20">
                   Subir Licitación
                </Link>
            </div>
        </div>
      </main>

        {/* Feature Strip (Bottom) */}
        <section className="relative md:absolute bottom-0 w-full border-t border-black/5 dark:border-white/5 bg-[#1a1c1a]/5 dark:bg-black/40 backdrop-blur-md py-8 mt-12 md:mt-0 animate-fade-up" style={{ animationDelay: '0.4s' }}>
             <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-center items-center gap-12 md:gap-24 opacity-80">
                <div className="flex items-center gap-4 group">
                    <div className="p-3 rounded-full bg-black/5 dark:bg-white/5 group-hover:bg-black/10 dark:group-hover:bg-white/10 transition-colors border border-black/5 dark:border-white/5">
                        <UploadCloud className="w-6 h-6 text-[#4A4F4A] dark:text-gray-300" />
                    </div>
                    <div className="text-left">
                        <h4 className="font-serif font-medium text-[#1a1c1a] dark:text-gray-200">Extracción Inteligente</h4>
                        <p className="text-xs text-[#6B726B] dark:text-gray-500 uppercase tracking-wider">Análisis Automático de Requisitos</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 group">
                    <div className="p-3 rounded-full bg-black/5 dark:bg-white/5 group-hover:bg-black/10 dark:group-hover:bg-white/10 transition-colors border border-black/5 dark:border-white/5">
                        <ShieldCheck className="w-6 h-6 text-[#4A4F4A] dark:text-gray-300" />
                    </div>
                    <div className="text-left">
                        <h4 className="font-serif font-medium text-[#1a1c1a] dark:text-gray-200">Verificación de Cumplimiento</h4>
                        <p className="text-xs text-[#6B726B] dark:text-gray-500 uppercase tracking-wider">Validación contra criterios</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 group">
                    <div className="p-3 rounded-full bg-black/5 dark:bg-white/5 group-hover:bg-black/10 dark:group-hover:bg-white/10 transition-colors border border-black/5 dark:border-white/5">
                        <Zap className="w-6 h-6 text-[#4A4F4A] dark:text-gray-300" />
                    </div>
                    <div className="text-left">
                        <h4 className="font-serif font-medium text-[#1a1c1a] dark:text-gray-200">Análisis Instantáneo</h4>
                        <p className="text-xs text-[#6B726B] dark:text-gray-500 uppercase tracking-wider">Retroalimentación IA en tiempo real</p>
                    </div>
                </div>
             </div>
        </section>
    </div>
  );
};
