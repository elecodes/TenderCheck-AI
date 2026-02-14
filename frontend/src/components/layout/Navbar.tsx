import React from 'react';
import { Link } from 'react-router-dom';
import { FileCheck, Menu, X, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <nav className="fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 md:h-32 md:pt-4 w-full">
          <div className="flex-shrink-0 flex items-center gap-4">
             <div className="bg-[#C5A028]/10 dark:bg-[#D4AF37]/10 p-2.5 rounded-full backdrop-blur-sm border border-[#C5A028]/20 dark:border-[#D4AF37]/20">
                <FileCheck className="h-5 w-5 text-[#C5A028] dark:text-[#D4AF37]" />
             </div>
             <span className="font-sans text-sm tracking-[0.2em] font-bold text-brand-gris dark:text-white uppercase mt-1">
               TenderCheck AI
             </span>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-6">
                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="p-2.5 rounded-full text-brand-gris dark:text-white hover:bg-brand-charcoal/5 dark:hover:bg-white/10 transition-colors mr-2"
                    aria-label="Toggle Theme"
                >
                    {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
               <Link to="/login" className="text-[10px] font-black text-[#C5A028] hover:text-[#B08D20] dark:text-[#D4AF37] dark:hover:text-[#E5C158] transition-soft uppercase tracking-[0.2em] border border-[#C5A028]/30 dark:border-[#D4AF37]/30 px-6 py-2.5 rounded-full hover:bg-[#C5A028]/10 dark:hover:bg-[#D4AF37]/10 hover-lift">
                  Iniciar Sesión
               </Link>
               <Link to="/register" className="px-8 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 dark:bg-[#D4AF37] dark:hover:bg-[#C5A028] text-white text-[10px] font-black uppercase tracking-[0.2em] transition-soft shadow-xl shadow-emerald-600/20 hover-lift active:scale-95 border border-emerald-600/20">
                  Comenzar
               </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center mr-6 gap-4">
            <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full text-brand-gris dark:text-white hover:bg-brand-charcoal/5 dark:hover:bg-white/10 transition-colors"
            >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-3 rounded-xl text-brand-gris dark:text-white bg-brand-charcoal/5 dark:bg-white/5 backdrop-blur-md border border-brand-charcoal/10 dark:border-white/10 hover:bg-brand-charcoal/10 dark:hover:bg-white/10 transition-all shadow-lg"
              aria-label="Menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-brand-crema/95 dark:bg-brand-charcoal/95 backdrop-blur-xl border-t border-brand-charcoal/10 dark:border-white/10 absolute w-full z-50 shadow-2xl animate-in slide-in-from-top-2">
          <div className="px-4 pt-4 pb-6 space-y-4 flex flex-col items-center">
            <Link 
              to="/login" 
              onClick={() => setIsOpen(false)}
              className="w-full text-center text-sm font-bold text-brand-gris dark:text-gray-200 uppercase tracking-widest py-3 border border-brand-charcoal/10 dark:border-white/10 rounded-xl hover:bg-brand-charcoal/5 dark:hover:bg-white/5"
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
