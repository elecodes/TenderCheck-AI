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
      if (dragActive) return "border-emerald-500 bg-emerald-500/5";
      if (selectedFile) return "border-emerald-500/50 bg-emerald-500/5 shadow-inner shadow-emerald-500/10";
      
      if (variant === 'pliego') return "border-gray-800 hover:border-emerald-500/50 bg-[#252c34]/50 hover:bg-[#2a323b]/60";
      if (variant === 'oferta') return "border-gray-800 hover:border-emerald-500/50 bg-[#252c34]/50 hover:bg-[#2a323b]/60";
      
      return "border-gray-800 hover:border-gray-700 bg-gray-900/50";
  };

  const IconColor = selectedFile 
    ? 'text-emerald-400' 
    : variant === 'pliego' ? 'text-orange-400/80 group-hover:text-orange-400' : variant === 'oferta' ? 'text-blue-400/80 group-hover:text-blue-400' : 'text-gray-500';

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
            "relative w-full h-full rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden group focus:outline-none focus:ring-2 focus:ring-emerald-500/50 backdrop-blur-sm",
            getBorderColor(),
            disabled && "opacity-50 cursor-not-allowed"
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
          disabled={disabled}
        />
        
        {selectedFile ? (
            <div className="text-center animate-in zoom-in duration-300 px-4">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-base font-semibold text-white mb-1 truncate max-w-[200px] mx-auto">
                    {selectedFile.name}
                </h3>
                <p className="text-xs text-emerald-500/80 font-medium uppercase tracking-wider">Documento Listo</p>
                
                <div className="mt-6 flex justify-center">
                    <button 
                       className="text-[10px] text-gray-500 hover:text-red-400 flex items-center space-x-2 transition-colors uppercase font-bold tracking-widest"
                       onClick={(e) => { e.stopPropagation(); onFileSelect(null as unknown as File); }}
                    >
                        <Trash2 className="w-3 h-3" /> <span>Cambiar Archivo</span>
                    </button>
                </div>
            </div>
        ) : (
            <div className="text-center space-y-5 pointer-events-none px-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-xl ${
                    variant === 'pliego' ? 'bg-orange-500/10 border border-orange-500/20' : 
                    variant === 'oferta' ? 'bg-blue-500/10 border border-blue-500/20' : 
                    'bg-gray-800/50 border border-gray-700/50'
                }`}>
                    <UploadCloud className={`w-7 h-7 ${IconColor} transition-colors duration-300`} />
                </div>
                <div className="space-y-1.5">
                    <p className="text-gray-300 font-medium text-sm">
                        <span className="text-emerald-500 font-bold">Subir {label}</span>
                    </p>
                    <p className="text-[11px] text-gray-500 font-medium uppercase tracking-tight">O arrastra el PDF aquí</p>
                </div>
            </div>
        )}

        {/* Shine effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
      </div>
    </div>
  );
};
