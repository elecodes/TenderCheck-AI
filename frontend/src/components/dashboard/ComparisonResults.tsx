import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface ValidationResult {
  requirementId: string;
  status: 'MET' | 'NOT_MET' | 'AMBIGUOUS';
  reasoning: string;
  evidence: {
    text: string;
    pageNumber: number;
  };
}

interface ComparisonResultsProps {
  results: ValidationResult[];
}

export const ComparisonResults = ({ results }: ComparisonResultsProps) => {
  if (!results || results.length === 0) return null;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Proposal Comparison Results</h3>
      
      <div className="grid gap-4">
        {results.map((result, idx) => (
          <div 
            key={idx} 
            className={`p-4 rounded-xl border-l-4 shadow-sm bg-white dark:bg-gray-900 ${
              result.status === 'MET' ? 'border-green-500' : 
              result.status === 'NOT_MET' ? 'border-red-500' : 'border-yellow-500'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                {result.status === 'MET' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                {result.status === 'NOT_MET' && <XCircle className="w-5 h-5 text-red-500" />}
                {result.status === 'AMBIGUOUS' && <AlertCircle className="w-5 h-5 text-yellow-500" />}
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  Requirement {idx + 1}
                </span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                 result.status === 'MET' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                 result.status === 'NOT_MET' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              }`}>
                {result.status}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{result.reasoning}</p>
            
            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-xs font-mono text-gray-500 dark:text-gray-500 mb-1">Evidence from Proposal:</p>
              <p className="text-sm italic text-gray-700 dark:text-gray-300">"{result.evidence.text}"</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
