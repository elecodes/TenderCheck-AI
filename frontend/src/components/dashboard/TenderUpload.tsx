import { useState, type ChangeEvent, type DragEvent } from 'react';
import { UploadCloud, CheckCircle2, Trash2, File as FileIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface TenderUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  disabled: boolean;
  label?: string;
  className?: string;
}

export const TenderUpload = ({ onFileSelect, selectedFile, disabled, className }: TenderUploadProps) => {
  const [dragActive, setDragActive] = useState(false);

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

  const clearFile = (e: React.MouseEvent) => {
      e.stopPropagation();
      // We need a way to clear selection, but props only have onFileSelect.
      // For now, re-selecting triggers it. 
      // Ideally we would have onClear.
      // Let's assume we can't clear easily without changing parent state, 
      // or we just select same file again.
      // Wait, parent controls state!
  };

  return (
    <div className={twMerge("w-full h-64", className)}>
      <div 
        className={clsx(
            "relative w-full h-full rounded-xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden group",
            dragActive ? "border-green-500 bg-green-50 dark:bg-green-900/10" : "border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-900/50",
            selectedFile ? "border-green-500 bg-green-50 dark:bg-green-900/10 ring-1 ring-green-500" : ""
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && document.getElementById('file-upload')?.click()}
      >
        <input 
          type="file" 
          id="file-upload" 
          className="hidden" 
          accept=".pdf"
          onChange={handleChange}
          disabled={disabled}
        />
        
        {selectedFile ? (
            <div className="text-center animate-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate max-w-[200px] mx-auto">
                    {selectedFile.name}
                </h3>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">Ready for analysis</p>
                <button 
                   className="mt-4 text-xs text-gray-400 hover:text-red-500 flex items-center justify-center mx-auto space-x-1 transition-colors"
                   onClick={(e) => { e.stopPropagation(); /* TODO: Implement clear */ }}
                >
                    <Trash2 className="w-3 h-3" /> <span>Change File</span>
                </button>
            </div>
        ) : (
            <div className="text-center space-y-4 pointer-events-none">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto transition-transform group-hover:scale-110 duration-300">
                    <UploadCloud className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <div className="space-y-1">
                    <p className="text-gray-900 dark:text-white font-medium">
                        <span className="text-green-600 dark:text-green-400 hover:underline">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PDF only</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
