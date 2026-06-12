import { X, FileText, BookOpen } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface CitationPreviewProps {
  pageNumber: number;
  pageText: string;
  highlightText: string;
  isOpen: boolean;
  onClose: () => void;
}

function highlightInText(text: string, search: string): React.ReactNode[] {
  if (!search) return [text];

  const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));

  const nodes: React.ReactNode[] = [];
  let key = 0;
  for (const part of parts) {
    if (part.toLowerCase() === search.toLowerCase()) {
      nodes.push(
        <mark
          key={key++}
          className="bg-emerald-200 dark:bg-emerald-700/60 text-emerald-900 dark:text-emerald-200 rounded px-0.5 font-medium"
        >
          {part}
        </mark>,
      );
    } else {
      nodes.push(<span key={key++}>{part}</span>);
    }
  }
  return nodes;
}

export const CitationPreview = ({
  pageNumber,
  pageText,
  highlightText,
  isOpen,
  onClose,
}: CitationPreviewProps) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
      <div
        ref={panelRef}
        className="relative w-full max-w-3xl max-h-[80vh] bg-white dark:bg-[#1a1f24] rounded-[28px] shadow-2xl border border-white/20 dark:border-white/10 flex flex-col animate-scale-in"
      >
        <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b border-gray-100 dark:border-white/10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-800">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-semibold text-brand-charcoal dark:text-white">
                Fuente del Documento
              </h3>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mt-0.5">
                Página {pageNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          {pageText ? (
            <div className="font-sans text-sm leading-relaxed text-brand-charcoal/80 dark:text-gray-300 whitespace-pre-wrap">
              {highlightInText(pageText, highlightText)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <FileText className="w-12 h-12 mb-3 opacity-40" />
              <p className="text-sm font-medium">
                Texto de página no disponible
              </p>
            </div>
          )}
        </div>

        <div className="px-8 py-4 border-t border-gray-100 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center space-x-2">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
          <span>Fragmento citado resaltado en verde</span>
        </div>
      </div>
    </div>
  );
};
