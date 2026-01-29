import React from 'react';
import { Link } from 'react-router-dom';
import { Scale } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          <div className="flex-shrink-0 flex items-center gap-4">
             <div className="bg-[#D4AF37]/10 p-2.5 rounded-full backdrop-blur-sm border border-[#D4AF37]/20">
                <Scale className="h-5 w-5 text-[#C5A028]" />
             </div>
             <span className="font-sans text-sm tracking-[0.2em] font-bold text-[#1a1c1a] uppercase mt-1">
               TenderCheck AI
             </span>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-6">
               <Link to="/login" className="text-sm font-bold text-[#C5A028] hover:text-[#b08d22] transition-colors uppercase tracking-widest border border-[#C5A028]/20 px-4 py-2 rounded-full hover:bg-[#C5A028]/10 shadow-md shadow-[#C5A028]/10">
                  Iniciar Sesión
               </Link>
               <Link to="/register" className="px-6 py-2.5 rounded-full bg-emerald-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/40 active:scale-95">
                  Comenzar
               </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
