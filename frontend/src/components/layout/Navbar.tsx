import React from 'react';
import { Link } from 'react-router-dom';
import { FileCheck, Menu, X } from 'lucide-react';
import { useState } from 'react';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 md:h-32 md:pt-4">
          <div className="flex-shrink-0 flex items-center gap-4">
             <div className="bg-[#D4AF37]/10 p-2.5 rounded-full backdrop-blur-sm border border-[#D4AF37]/20">
                <FileCheck className="h-5 w-5 text-[#C5A028]" />
             </div>
             <span className="font-sans text-sm tracking-[0.2em] font-bold text-[#1a1c1a] uppercase mt-1">
               TenderCheck AI
             </span>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-6 mr-16 lg:mr-48">
               <Link to="/login" className="text-sm font-bold text-[#C5A028] hover:text-[#b08d22] transition-colors uppercase tracking-widest border border-[#C5A028]/20 px-4 py-2 rounded-full hover:bg-[#C5A028]/10 shadow-md shadow-[#C5A028]/10">
                  Iniciar Sesión
               </Link>
               <Link to="/register" className="px-6 py-2.5 rounded-full bg-emerald-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/40 active:scale-95">
                  Comenzar
               </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center mr-6">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-3 rounded-xl text-[#2D312D] bg-[#D4AF37]/20 backdrop-blur-md border border-[#D4AF37]/30 hover:bg-[#D4AF37]/30 transition-all shadow-lg"
              aria-label="Menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white/90 backdrop-blur-md border-t border-[#D4AF37]/20 absolute w-full z-50 shadow-xl animate-in slide-in-from-top-2">
          <div className="px-4 pt-4 pb-6 space-y-4 flex flex-col items-center">
            <Link 
              to="/login" 
              onClick={() => setIsOpen(false)}
              className="w-full text-center text-sm font-bold text-[#2D312D] uppercase tracking-widest py-3 border border-[#C5A028]/20 rounded-xl hover:bg-[#C5A028]/10"
            >
              Iniciar Sesión
            </Link>
            <Link 
              to="/register" 
              onClick={() => setIsOpen(false)}
              className="w-full text-center py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold uppercase tracking-widest shadow-lg active:scale-95"
            >
              Comenzar
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
