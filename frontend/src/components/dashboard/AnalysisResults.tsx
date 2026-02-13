import type { TenderAnalysis, ValidationResult } from '../../types';
import { FileText, Download, FileJson, RotateCcw } from 'lucide-react';
import { exportToJSON, exportToPDF } from '../../services/export.service';

interface AnalysisResultsProps {
  analysis: TenderAnalysis;
  validationResults?: ValidationResult[];
  onReset: () => void;
}

export const AnalysisResults = ({ analysis, validationResults, onReset }: AnalysisResultsProps) => {

  const handleExport = (type: 'pdf' | 'json') => {
      // Merge analysis with validation results for export
      const dataToExport = {
          ...analysis,
          results: validationResults || analysis.results || []
      };

      if (type === 'pdf') {
          exportToPDF(dataToExport);
      } else {
          exportToJSON(dataToExport);
      }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-10 animate-fade-up">
      
      {/* Header Card */}
      <div className="bg-white dark:bg-gray-800 backdrop-blur-3xl rounded-[32px] shadow-xl border border-gray-200 dark:border-gray-700 p-10 transition-soft hover-lift hover:border-emerald-100/50 dark:hover:border-emerald-900/50">
        
        {/* Row 1: Title (Full Width) */}
        <div className="flex items-start space-x-6 mb-8">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex-shrink-0 border border-emerald-200 dark:border-emerald-800">
              <FileText className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className={`${analysis.tenderTitle.length > 80 ? 'text-xl md:text-2xl' : 'text-3xl md:text-4xl'} font-serif font-medium text-gray-900 dark:text-white leading-[1.2]`}>
              {analysis.tenderTitle}
            </h2>
        </div>

        {/* Row 2: Metadata & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-t border-gray-100 dark:border-gray-700 pt-8">
            
            {/* Metadata (Left) */}
            <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                <span className="flex items-center bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-full border border-gray-100 dark:border-gray-700">
                    ID: {analysis.id.slice(0, 8)}
                </span>
                <span className="flex items-center bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-full border border-gray-100 dark:border-gray-700">
                    {new Date(analysis.createdAt).toLocaleDateString()}
                </span>
                <span className={`px-4 py-2 rounded-full border font-black ${
                    analysis.status === 'COMPLETED' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800 text-amber-600 dark:text-amber-400'
                }`}>
                    {analysis.status === 'COMPLETED' ? 'COMPLETADO' : analysis.status}
                </span>
            </div>

            {/* Actions (Right) */}
            <div className="flex flex-wrap gap-3 flex-shrink-0">
              <button 
                onClick={() => handleExport('json')}
                className="flex items-center space-x-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-xl transition-soft hover-lift"
                title="Exportar como JSON"
              >
                <FileJson className="w-4 h-4" />
                <span>JSON</span>
              </button>
              
              <button 
                onClick={() => handleExport('pdf')}
                className="flex items-center space-x-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 rounded-xl transition-soft hover-lift"
                title="Exportar como PDF"
              >
                <Download className="w-4 h-4" />
                <span>PDF</span>
              </button>

              <button 
                onClick={onReset}
                className="flex items-center space-x-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-100 dark:border-gray-600 rounded-xl transition-soft hover-lift"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Nuevo</span>
              </button>
            </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-4">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white flex items-center">
               <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-3 animate-pulse" />
               Requisitos Detectados
            </h3>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest">
                {analysis.requirements?.length || 0} items
            </span>
        </div>
        
        <div className="grid gap-6">
            {analysis.requirements && analysis.requirements.length > 0 ? (
                analysis.requirements.map((req, idx) => (
                    <div key={idx} className={`p-8 rounded-[28px] border bg-white dark:bg-gray-800 backdrop-blur-md transition-soft hover-lift shadow-sm hover:shadow-md ${
                        req.type === 'MANDATORY' 
                            ? 'border-gray-200 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-700' 
                            : 'border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700'
                    }`}>
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center space-x-4">
                                <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg border ${
                                    req.type === 'MANDATORY' 
                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' 
                                        : 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800'
                                }`}>
                                    {(() => {
                                        switch(req.type) {
                                            case 'MANDATORY': return 'OBLIGATORIO';
                                            case 'OPTIONAL': return 'OPCIONAL';
                                            case 'TECHNICAL': return 'TÉCNICO';
                                            case 'ADMINISTRATIVE': return 'ADMINISTRATIVO';
                                            case 'LEGAL': return 'LEGAL';
                                            case 'FINANCIAL': return 'FINANCIERO';
                                            default: return req.type;
                                        }
                                    })()}
                                </span>
                                {req.source.pageNumber > 0 && (
                                    <span className="text-[9px] uppercase tracking-[0.2em] font-black text-gray-400 dark:text-gray-500">
                                        Pág. {req.source.pageNumber}
                                    </span>
                                )}
                            </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-lg font-sans font-medium leading-relaxed mb-6">{req.text}</p>
                        <div className="flex flex-wrap gap-2">
                            {req.keywords.map((kw, kIdx) => (
                                <span key={kIdx} className="text-[9px] font-black bg-gray-50 dark:bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-800 transition-soft uppercase tracking-widest cursor-default">
                                    {kw}
                                </span>
                            ))}
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center p-16 bg-gray-50/50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500 opacity-50" />
                    </div>
                    <p className="font-bold tracking-tight">No se han detectado requisitos en este documento.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
