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
      case 'MET': return 'border-emerald-200 bg-emerald-50/50 hover:border-emerald-300';
      case 'NOT_MET': return 'border-red-200 bg-red-50/50 hover:border-red-300';
      case 'PARTIALLY_MET': 
      case 'AMBIGUOUS': 
        return 'border-amber-200 bg-amber-50/50 hover:border-amber-300';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getStatusTextColor = (status: ValidationResult['status']) => {
    switch (status) {
      case 'MET': return 'text-emerald-700';
      case 'NOT_MET': return 'text-red-700';
      case 'PARTIALLY_MET': 
      case 'AMBIGUOUS':
        return 'text-amber-700';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: ValidationResult['status']) => {
    switch (status) {
      case 'MET': return <CheckCircle className="text-emerald-600 w-5 h-5 flex-shrink-0" />;
      case 'NOT_MET': return <XCircle className="text-red-600 w-5 h-5 flex-shrink-0" />;
      case 'PARTIALLY_MET': 
      case 'AMBIGUOUS':
        return <AlertTriangle className="text-amber-600 w-5 h-5 flex-shrink-0" />;
      default: return <AlertTriangle className="text-gray-400 w-5 h-5 flex-shrink-0" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex items-center justify-between px-2">
          <h3 className="text-2xl font-serif font-medium text-gray-900 flex items-center tracking-tight">
             <Scale className="w-6 h-6 mr-3 text-blue-600" />
             Resultado de Validación de Oferta
          </h3>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
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
              className={`p-8 rounded-[28px] border transition-soft hover-lift backdrop-blur-md group shadow-sm ${getStatusColor(result.status)}`}
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-xl shadow-sm bg-white border border-gray-100 transition-soft group-hover:scale-110`}>
                      {getStatusIcon(result.status)}
                    </div>
                    <span className={`font-serif text-lg leading-snug ${getStatusTextColor(result.status)}`}>
                      {displayTitle}
                    </span>
                  </div>
                
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {result.reasoning}
                  </p>
                  
                  {result.evidence && (
                    <div className="p-4 bg-white rounded-xl border border-gray-200 relative overflow-hidden shadow-sm">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/30" />
                      <span className="text-[10px] uppercase font-black tracking-widest text-gray-400 block mb-2">Evidencia detectada</span>
                      <p className="text-sm italic text-gray-500 font-medium leading-relaxed">
                        "{result.evidence.text}"
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-3 min-w-[100px]">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                    result.status === 'MET' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                    result.status === 'NOT_MET' ? 'bg-red-100 text-red-700 border-red-200' : 
                    'bg-amber-100 text-amber-700 border-amber-200'
                  }`}>
                    {result.status === 'MET' ? 'CUMPLE' : 
                     result.status === 'NOT_MET' ? 'NO CUMPLE' : 
                     result.status === 'PARTIALLY_MET' ? 'PARCIAL' : result.status}
                  </span>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                    Fiabilidad AI: <span className="text-gray-600">
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
