import type { TenderAnalysis } from '../../types';
import { FileText, Download, FileJson, FileCode, RotateCcw } from 'lucide-react';
import { exportToJSON, exportToPDF } from '../../services/export.service';

interface AnalysisResultsProps {
  analysis: TenderAnalysis;
  onReset: () => void;
}

export const AnalysisResults = ({ analysis, onReset }: AnalysisResultsProps) => {

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Card */}
      <div className="bg-[#1e242c]/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-800/50 p-8 flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <FileText className="w-6 h-6 text-emerald-500" />
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight">{analysis.tenderTitle}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium uppercase tracking-widest text-gray-500">
            <span className="flex items-center bg-gray-800/50 px-3 py-1 rounded-full border border-gray-700/50">
                ID: {analysis.id.slice(0, 8)}
            </span>
            <span className="flex items-center bg-gray-800/50 px-3 py-1 rounded-full border border-gray-700/50">
                {new Date(analysis.createdAt).toLocaleDateString()}
            </span>
            <span className={`px-3 py-1 rounded-full border font-bold ${
                analysis.status === 'COMPLETED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
            }`}>
                {analysis.status}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => exportToJSON(analysis)}
            className="flex items-center space-x-2 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl transition-all active:scale-95"
            title="Exportar como JSON"
          >
            <FileJson className="w-4 h-4" />
            <span>JSON</span>
          </button>
          
          <button 
            onClick={() => exportToPDF(analysis)}
            className="flex items-center space-x-2 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl transition-all active:scale-95"
            title="Exportar como PDF"
          >
            <Download className="w-4 h-4" />
            <span>PDF Report</span>
          </button>

          <button 
            onClick={onReset}
            className="flex items-center space-x-2 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700 border border-gray-700/50 rounded-xl transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-bold text-white flex items-center">
               <FileCode className="w-5 h-5 mr-3 text-emerald-500" />
               Requisitos Extraídos del Pliego
            </h3>
            <span className="text-sm text-gray-500 font-medium font-mono uppercase tracking-tighter">
                {analysis.requirements?.length || 0} items encontrados
            </span>
        </div>
        
        <div className="grid gap-4">
            {analysis.requirements && analysis.requirements.length > 0 ? (
                analysis.requirements.map((req, idx) => (
                    <div key={idx} className={`p-6 rounded-2xl border transition-all bg-[#252c34]/40 hover:bg-[#2a323b]/50 backdrop-blur-sm ${
                        req.type === 'MANDATORY' 
                            ? 'border-emerald-500/10 hover:border-emerald-500/30' 
                            : 'border-purple-500/10 hover:border-purple-500/30'
                    }`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-3">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-inner ${
                                    req.type === 'MANDATORY' 
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' 
                                        : 'bg-purple-500/20 text-purple-400 border border-purple-500/20'
                                }`}>
                                    {req.type}
                                </span>
                                <span className="text-[10px] uppercase tracking-widest font-bold text-gray-600">
                                    Pag. {req.source.pageNumber}
                                </span>
                            </div>
                            <div className="h-1 w-12 bg-gray-800/50 rounded-full" />
                        </div>
                        <p className="text-gray-200 text-lg font-medium leading-snug mb-4">{req.text}</p>
                        <div className="flex flex-wrap gap-2">
                            {req.keywords.map((kw, kIdx) => (
                                <span key={kIdx} className="text-[10px] font-bold bg-brand-dark/50 px-3 py-1 rounded-lg border border-gray-800 text-gray-500 hover:text-emerald-500 hover:border-emerald-500/30 transition-colors uppercase tracking-tight">
                                    #{kw}
                                </span>
                            ))}
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center p-16 bg-[#1e242c]/40 rounded-3xl border border-dashed border-gray-800 text-gray-600">
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
