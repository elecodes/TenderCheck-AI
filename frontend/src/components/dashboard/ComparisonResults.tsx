import { CheckCircle, XCircle, AlertTriangle, Scale } from 'lucide-react';
import type { TenderAnalysis, ValidationResult } from '../../types';

interface ComparisonResultsProps {
  results: ValidationResult[];
  analysis?: TenderAnalysis;
}

export const ComparisonResults = ({ results, analysis }: ComparisonResultsProps) => {
  // We filter out SCOPE_CHECK as it is handled in AnalysisResults as a badge
  const filteredResults = (results || []).filter(r => r.requirementId !== 'SCOPE_CHECK');
  
  if (filteredResults.length === 0) return null;

  const getStatusColor = (status: ValidationResult['status']) => {
    switch (status) {
      case 'MET': return 'border-emerald-500/30 bg-emerald-900/10 hover:border-emerald-500/50';
      case 'NOT_MET': return 'border-red-500/30 bg-red-900/10 hover:border-red-500/50';
      case 'PARTIALLY_MET': 
      case 'AMBIGUOUS': 
        return 'border-amber-500/30 bg-amber-900/10 hover:border-amber-500/50';
      default: return 'border-gray-700 bg-gray-800/30';
    }
  };

  const getStatusTextColor = (status: ValidationResult['status']) => {
    switch (status) {
      case 'MET': return 'text-emerald-400';
      case 'NOT_MET': return 'text-red-400';
      case 'PARTIALLY_MET': 
      case 'AMBIGUOUS':
        return 'text-amber-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: ValidationResult['status']) => {
    switch (status) {
      case 'MET': return <CheckCircle className="text-emerald-500 w-5 h-5 flex-shrink-0" />;
      case 'NOT_MET': return <XCircle className="text-red-500 w-5 h-5 flex-shrink-0" />;
      case 'PARTIALLY_MET': 
      case 'AMBIGUOUS':
        return <AlertTriangle className="text-amber-500 w-5 h-5 flex-shrink-0" />;
      default: return <AlertTriangle className="text-gray-500 w-5 h-5 flex-shrink-0" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex items-center justify-between px-2">
          <h3 className="text-2xl font-serif font-medium text-white flex items-center tracking-tight">
             <Scale className="w-6 h-6 mr-3 text-blue-500" />
             Resultado de Validación de Oferta
          </h3>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
              Analizado por AI
          </span>
      </div>
      
      <div className="grid gap-6">
        {filteredResults.map((result, idx) => {
          const matchingReq = analysis?.requirements?.find(r => r.id === result.requirementId);
          const displayTitle = matchingReq?.text || result.requirementId;

          return (
            <div 
              key={idx} 
              className={`p-8 rounded-[28px] border transition-soft hover-lift backdrop-blur-md group ${getStatusColor(result.status)}`}
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-xl shadow-inner ${getStatusColor(result.status)} bg-opacity-20 transition-soft group-hover:scale-110`}>
                      {getStatusIcon(result.status)}
                    </div>
                    <span className={`font-serif text-lg leading-snug ${getStatusTextColor(result.status)}`}>
                      {displayTitle}
                    </span>
                  </div>
                
                  <p className="text-gray-300 leading-relaxed text-sm">
                    {result.reasoning}
                  </p>
                  
                  {result.evidence && (
                    <div className="p-4 bg-brand-dark/20 rounded-xl border border-gray-800/50 relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/30" />
                      <span className="text-[10px] uppercase font-black tracking-widest text-gray-600 block mb-2">Evidencia detectada</span>
                      <p className="text-sm italic text-gray-400 font-medium leading-relaxed">
                        "{result.evidence.text}"
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-3 min-w-[100px]">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-lg ${
                    result.status === 'MET' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' : 
                    result.status === 'NOT_MET' ? 'bg-red-500/20 text-red-400 border-red-500/20' : 
                    'bg-amber-500/20 text-amber-400 border-amber-500/20'
                  }`}>
                    {result.status === 'MET' ? 'CUMPLE' : 
                     result.status === 'NOT_MET' ? 'NO CUMPLE' : 
                     result.status === 'PARTIALLY_MET' ? 'PARCIAL' : result.status}
                  </span>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                    Fiabilidad AI: <span className="text-gray-300">
                      {(result.confidence > 1 ? result.confidence : result.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
