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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-up">
      {/* Overall Score */}
      <div className="bg-white/[0.03] backdrop-blur-3xl rounded-[32px] p-8 border border-white/10 flex items-center space-x-8 transition-soft hover-lift hover:border-emerald-500/20 shadow-2xl">
        <div className="relative h-24 w-24 flex items-center justify-center">
          <svg className="h-24 w-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              fill="transparent"
              stroke="white"
              strokeOpacity="0.05"
              strokeWidth="10"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              fill="transparent"
              stroke="#10b981"
              strokeWidth="10"
              strokeDasharray={251.2}
              strokeDashoffset={251.2 - (251.2 * score) / 100}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            />
          </svg>
          <span className="absolute text-2xl font-black text-white">{score}%</span>
        </div>
        <div>
          <h4 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Puntuación</h4>
          <p className="text-white font-bold text-xl">Cumplimiento</p>
        </div>
      </div>

      {/* Mandatory Stats */}
      <div className="bg-white/[0.03] backdrop-blur-3xl rounded-[32px] p-8 border border-white/5 flex items-center space-x-6 transition-soft hover-lift hover:border-emerald-500/10">
        <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
          <Target className="w-8 h-8 text-emerald-500" />
        </div>
        <div>
          <h4 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Obligatorios</h4>
          <p className="text-3xl font-black text-white">
            {stats.mandatory.met} <span className="text-gray-600 text-sm font-bold uppercase tracking-widest">/ {stats.mandatory.total}</span>
          </p>
        </div>
      </div>

      {/* Optional Stats */}
      <div className="bg-white/[0.03] backdrop-blur-3xl rounded-[32px] p-8 border border-white/5 flex items-center space-x-6 transition-soft hover-lift hover:border-purple-500/10">
        <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20">
          <Award className="w-8 h-8 text-purple-500" />
        </div>
        <div>
          <h4 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Opcionales</h4>
          <p className="text-3xl font-black text-white">
            {stats.optional.met} <span className="text-gray-600 text-sm font-bold uppercase tracking-widest">/ {stats.optional.total}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
