import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { UploadCloud, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-[#D3D0C2] bg-gradient-to-br from-[#E8E6DE] via-[#D3D0C2] to-[#B8C1B7] text-[#1a1c1a] overflow-hidden relative font-sans isolation-auto">
      <Navbar />

      {/* Decorative Orbs (Mixed) */}
      <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-white/40 rounded-full blur-[150px] pointer-events-none mix-blend-overlay" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-[#D4AF37]/15 rounded-full blur-[120px] pointer-events-none mix-blend-overlay" />

      {/* Hero Section */}
      <main className="pt-48 pb-48 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
        
        {/* Logo/Badge */}
        <div className="mb-12 opacity-80">
             {/* Optional top badge */}
        </div>

        <h1 className="text-6xl md:text-8xl font-serif font-medium mb-8 leading-[0.9] max-w-5xl text-[#1a1c1a] tracking-tight">
          Precisión en cada <br/> propuesta.
        </h1>
        
        <p className="text-xl md:text-2xl text-[#4a4f4a] max-w-2xl mb-16 font-light leading-relaxed">
          Análisis de alta fidelidad para documentos complejos de contratación pública. 
          Sube tus <span className="text-[#C5A028] font-serif italic">Pliegos</span> para cumplimiento instantáneo.
        </p>

        {/* Central Glass Card */}
        <div className="w-full max-w-md relative group">
            {/* Card Background */}
            <div className="absolute -inset-1 bg-gradient-to-b from-[#C5A028]/20 to-emerald-500/5 rounded-[35px] blur-sm opacity-50 group-hover:opacity-75 transition duration-500"></div>
            
            <div className="relative rounded-[32px] bg-white/20 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] p-12 flex flex-col items-center gap-8 overflow-hidden">
                
                {/* Icon Box */}
                <div className="w-20 h-20 rounded-2xl bg-[#effaf3] shadow-inner flex items-center justify-center mb-2 border border-[#C5A028]/20">
                    <UploadCloud className="w-8 h-8 text-[#C5A028]" />
                </div>
                
                <div className="text-center space-y-3">
                    <h3 className="font-serif text-3xl text-[#1a1c1a]">Nuevo Análisis</h3>
                    <p className="text-[#5a605a] text-lg leading-snug max-w-[260px]">
                        Sube tus documentos PDF de licitación para verificación de cumplimiento impulsada por IA.
                    </p>
                </div>

                <Link to="/register" className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold tracking-widest uppercase shadow-xl shadow-emerald-600/40 transition-all active:scale-[0.98] flex items-center justify-center mt-4">
                   Subir Licitación
                </Link>
            </div>
        </div>
      </main>

        {/* Feature Strip (Bottom) */}
        <section className="absolute bottom-0 w-full border-t border-white/10 bg-gradient-to-t from-black/5 to-transparent backdrop-blur-[2px] py-8">
             <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-center items-center gap-12 md:gap-24 opacity-80">
                <div className="flex items-center gap-4 group">
                    <div className="p-3 rounded-full bg-white/40 group-hover:bg-white/60 transition-colors">
                        <UploadCloud className="w-6 h-6 text-[#1a1c1a]" />
                    </div>
                    <div className="text-left">
                        <h4 className="font-serif font-medium text-[#1a1c1a]">Extracción Inteligente</h4>
                        <p className="text-xs text-[#5a605a] uppercase tracking-wider">Análisis Automático de Requisitos</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 group">
                    <div className="p-3 rounded-full bg-white/40 group-hover:bg-white/60 transition-colors">
                        <ShieldCheck className="w-6 h-6 text-[#1a1c1a]" />
                    </div>
                    <div className="text-left">
                        <h4 className="font-serif font-medium text-[#1a1c1a]">Verificación de Cumplimiento</h4>
                        <p className="text-xs text-[#5a605a] uppercase tracking-wider">Validación contra criterios</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 group">
                    <div className="p-3 rounded-full bg-white/40 group-hover:bg-white/60 transition-colors">
                        <Zap className="w-6 h-6 text-[#1a1c1a]" />
                    </div>
                    <div className="text-left">
                        <h4 className="font-serif font-medium text-[#1a1c1a]">Análisis Instantáneo</h4>
                        <p className="text-xs text-[#5a605a] uppercase tracking-wider">Retroalimentación IA en tiempo real</p>
                    </div>
                </div>
             </div>
        </section>
    </div>
  );
};
