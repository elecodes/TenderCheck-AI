import { Target, Award } from 'lucide-react';
import type { TenderAnalysis, ValidationResult } from '../../types';

interface ValidationSummaryProps {
  analysis: TenderAnalysis;
  results: ValidationResult[];
}

export const ValidationSummary = ({ analysis, results }: ValidationSummaryProps) => {
  const requirements = analysis.requirements || [];
  const complianceResults = results.filter(r => r.requirementId !== 'SCOPE_CHECK');

  // Helper to normalize backend types to frontend binary categories
  const isMandatory = (type: string) => 
    ['MANDATORY', 'TECHNICAL', 'ADMINISTRATIVE', 'LEGAL', 'SECURITY'].includes(type);
    
  const isOptional = (type: string) => 
    ['OPTIONAL', 'FINANCIAL', 'VALUE_ADDED'].includes(type);

  const stats = {
    mandatory: {
      total: requirements.filter(r => isMandatory(r.type)).length,
      met: complianceResults.filter(res => {
        const req = requirements.find(r => r.id === res.requirementId);
        // Also count PARTIALLY_MET as effectively counting towards progress/stats if needed, 
        // but traditionally stats are strict. Let's keep strict "MET" for now or use score.
        // Actually, let's map PARTIALLY_MET to at least visible progress later. 
        // For now, strict 'MET'.
        return req && isMandatory(req.type) && res.status === 'MET';
      }).length,
    },
    optional: {
      total: requirements.filter(r => isOptional(r.type)).length,
      met: complianceResults.filter(res => {
        const req = requirements.find(r => r.id === res.requirementId);
        return req && isOptional(req.type) && res.status === 'MET';
      }).length,
    }
  };

  const totalMet = stats.mandatory.met + stats.optional.met;
  const totalReqs = stats.mandatory.total + stats.optional.total;
  const score = totalReqs > 0 ? Math.round((totalMet / totalReqs) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
      {/* Overall Score */}
      <div className="bg-brand-dark/40 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/20 flex items-center space-x-6">
        <div className="relative h-20 w-20 flex items-center justify-center">
          <svg className="h-20 w-20 transform -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="transparent"
              stroke="#1f2937"
              strokeWidth="8"
            />
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="transparent"
              stroke="#10b981"
              strokeWidth="8"
              strokeDasharray={213.6}
              strokeDashoffset={213.6 - (213.6 * score) / 100}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <span className="absolute text-xl font-black text-white">{score}%</span>
        </div>
        <div>
          <h4 className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Puntuación Total</h4>
          <p className="text-white font-bold">Cumplimiento General</p>
        </div>
      </div>

      {/* Mandatory Stats */}
      <div className="bg-brand-dark/40 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/10 flex items-center space-x-4">
        <div className="p-3 bg-emerald-500/10 rounded-xl">
          <Target className="w-6 h-6 text-emerald-500" />
        </div>
        <div>
          <h4 className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Obligatorios</h4>
          <p className="text-2xl font-black text-white">
            {stats.mandatory.met} <span className="text-gray-600 text-sm font-bold">/ {stats.mandatory.total}</span>
          </p>
        </div>
      </div>

      {/* Optional Stats */}
      <div className="bg-brand-dark/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/10 flex items-center space-x-4">
        <div className="p-3 bg-purple-500/10 rounded-xl">
          <Award className="w-6 h-6 text-purple-500" />
        </div>
        <div>
          <h4 className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Opcionales</h4>
          <p className="text-2xl font-black text-white">
            {stats.optional.met} <span className="text-gray-600 text-sm font-bold">/ {stats.optional.total}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
