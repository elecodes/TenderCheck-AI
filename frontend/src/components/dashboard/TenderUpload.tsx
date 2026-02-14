import { useState, type ChangeEvent, type DragEvent, type KeyboardEvent } from 'react';
import { UploadCloud, CheckCircle2, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface TenderUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  disabled: boolean;
  label?: string;
  variant?: 'default' | 'pliego' | 'oferta';
  className?: string;
}

export const TenderUpload = ({ onFileSelect, selectedFile, disabled, className, label, variant = 'default' }: TenderUploadProps) => {
  const [dragActive, setDragActive] = useState(false);

  const getBorderColor = () => {
      if (dragActive) return "border-emerald-500/50 dark:border-emerald-500/50 bg-white/40 dark:bg-emerald-900/20 backdrop-blur-md";
      if (selectedFile) return "border-emerald-500/20 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-900/10 shadow-lg shadow-emerald-500/5";
      
      return "border-white/40 dark:border-white/5 hover:border-emerald-500/30 dark:hover:border-emerald-400/30 bg-white/30 dark:bg-white/5 hover:bg-white/50 dark:hover:bg-white/10 shadow-sm transition-all backdrop-blur-sm";
  };

  const IconColor = selectedFile 
    ? 'text-emerald-500' 
    : variant === 'pliego' ? 'text-orange-400/80 group-hover:text-orange-500' : variant === 'oferta' ? 'text-blue-400/80 group-hover:text-blue-500' : 'text-gray-400';

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed');
      return;
    }
    onFileSelect(file);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled) {
          document.getElementById(`file-upload-${variant}`)?.click();
      }
    }
  };

  return (
    <div className={twMerge("w-full h-64", className)}>
      <div 
        role="button"
        tabIndex={0}
        aria-label={label ? `Upload ${label}` : "Upload file"}
        className={clsx(
            "relative w-full h-full rounded-2xl border transition-soft hover-lift flex flex-col items-center justify-center cursor-pointer overflow-hidden group focus:outline-none focus:ring-1 focus:ring-emerald-500/30",
            getBorderColor(),
            disabled && "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/5"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && document.getElementById(`file-upload-${variant}`)?.click()}
        onKeyDown={handleKeyDown}
      >
        <input 
          type="file" 
          id={`file-upload-${variant}`}
          className="hidden" 
          accept=".pdf"
          onChange={handleChange}
          onClick={(e) => e.stopPropagation()}
          disabled={disabled}
        />
        
        {selectedFile ? (
            <div className="text-center animate-fade-up px-4">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-800 shadow-xl shadow-emerald-100 dark:shadow-none">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-base font-semibold text-brand-charcoal dark:text-white mb-1 truncate max-w-[200px] mx-auto">
                    {selectedFile.name}
                </h3>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest">Documento Verificado</p>
                
                <div className="mt-6 flex justify-center">
                    <button 
                       className="text-[10px] text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 flex items-center space-x-2 transition-colors uppercase font-black tracking-[0.2em]"
                       onClick={(e) => { e.stopPropagation(); onFileSelect(null as unknown as File); }}
                    >
                        <Trash2 className="w-3 h-3" /> <span>Eliminar</span>
                    </button>
                </div>
            </div>
        ) : (
            <div className="text-center space-y-5 pointer-events-none px-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto transition-soft group-hover:scale-110 shadow-sm ${
                    variant === 'pliego' ? 'bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100/50 dark:border-orange-900/30' : 
                    variant === 'oferta' ? 'bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-900/30' : 
                    'bg-white/50 dark:bg-white/10 border border-white/20 dark:border-white/5'
                }`}>
                    <UploadCloud className={`w-7 h-7 ${IconColor} transition-colors duration-300`} />
                </div>
                <div className="space-y-1.5">
                    <p className="font-medium text-sm text-brand-charcoal/40 dark:text-gray-500">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold tracking-tight">Subir {label}</span>
                    </p>
                    <p className="text-[10px] text-brand-charcoal/40 dark:text-gray-500 font-bold uppercase tracking-[0.1em]">O arrastra el PDF aquí</p>
                </div>
            </div>
        )}

        {/* Shine effect on hover - subtle for light mode */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
      </div>
    </div>
  );
};

