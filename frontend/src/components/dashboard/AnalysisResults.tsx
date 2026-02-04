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
      <div className="bg-white/[0.03] backdrop-blur-3xl rounded-[32px] shadow-2xl border border-white/10 p-10 transition-soft hover-lift hover:border-white/20">
        
        {/* Row 1: Title (Full Width) */}
        <div className="flex items-start space-x-6 mb-8">
            <div className="p-3 bg-emerald-500/10 rounded-2xl flex-shrink-0 border border-emerald-500/20">
              <FileText className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className={`${analysis.tenderTitle.length > 80 ? 'text-xl md:text-2xl' : 'text-3xl md:text-4xl'} font-serif font-medium text-white leading-[1.2]`}>
              {analysis.tenderTitle}
            </h2>
        </div>

        {/* Row 2: Metadata & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-t border-white/5 pt-8">
            
            {/* Metadata (Left) */}
            <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                <span className="flex items-center bg-white/[0.02] px-4 py-2 rounded-full border border-white/5">
                    ID: {analysis.id.slice(0, 8)}
                </span>
                <span className="flex items-center bg-white/[0.02] px-4 py-2 rounded-full border border-white/5">
                    {new Date(analysis.createdAt).toLocaleDateString()}
                </span>
                <span className={`px-4 py-2 rounded-full border font-black ${
                    analysis.status === 'COMPLETED' ? 'bg-emerald-500/10 border-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 border-amber-500/10 text-amber-500'
                }`}>
                    {analysis.status === 'COMPLETED' ? 'COMPLETADO' : analysis.status}
                </span>
            </div>

            {/* Actions (Right) */}
            <div className="flex flex-wrap gap-3 flex-shrink-0">
              <button 
                onClick={() => handleExport('json')}
                className="flex items-center space-x-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/10 rounded-xl transition-soft hover-lift"
                title="Exportar como JSON"
              >
                <FileJson className="w-4 h-4" />
                <span>JSON</span>
              </button>
              
              <button 
                onClick={() => handleExport('pdf')}
                className="flex items-center space-x-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/10 rounded-xl transition-soft hover-lift"
                title="Exportar como PDF"
              >
                <Download className="w-4 h-4" />
                <span>PDF</span>
              </button>

              <button 
                onClick={onReset}
                className="flex items-center space-x-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-soft hover-lift"
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
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white flex items-center">
               <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-3 animate-pulse" />
               Requisitos Detectados
            </h3>
            <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">
                {analysis.requirements?.length || 0} items
            </span>
        </div>
        
        <div className="grid gap-6">
            {analysis.requirements && analysis.requirements.length > 0 ? (
                analysis.requirements.map((req, idx) => (
                    <div key={idx} className={`p-8 rounded-[28px] border bg-white/[0.02] backdrop-blur-md transition-soft hover-lift ${
                        req.type === 'MANDATORY' 
                            ? 'border-white/5 hover:border-emerald-500/20' 
                            : 'border-white/5 hover:border-purple-500/20'
                    }`}>
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center space-x-4">
                                <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg border ${
                                    req.type === 'MANDATORY' 
                                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                        : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
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
                                    <span className="text-[9px] uppercase tracking-[0.2em] font-black text-gray-700">
                                        Pág. {req.source.pageNumber}
                                    </span>
                                )}
                            </div>
                        </div>
                        <p className="text-gray-200 text-lg font-sans font-medium leading-relaxed mb-6">{req.text}</p>
                        <div className="flex flex-wrap gap-2">
                            {req.keywords.map((kw, kIdx) => (
                                <span key={kIdx} className="text-[9px] font-black bg-white/[0.02] px-3 py-1.5 rounded-lg border border-white/5 text-gray-600 hover:text-emerald-500 hover:border-emerald-500/20 transition-soft uppercase tracking-widest cursor-default">
                                    {kw}
                                </span>
                            ))}
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center p-16 bg-[#0a0a0a]/40 rounded-3xl border border-dashed border-gray-800 text-gray-700">
                    <div className="w-16 h-16 bg-gray-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 opacity-20" />
                    </div>
                    <p className="font-bold tracking-tight">No se han detectado requisitos en este documento.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
