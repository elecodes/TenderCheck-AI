import type { TenderAnalysis, ValidationResult } from '../../types';
import { CheckCircle, XCircle, AlertTriangle, FileText } from 'lucide-react';

interface AnalysisResultsProps {
  analysis: TenderAnalysis;
  onReset: () => void;
}

export const AnalysisResults = ({ analysis, onReset }: AnalysisResultsProps) => {
  const getStatusIcon = (status: ValidationResult['status']) => {
    switch (status) {
      case 'MET': return <CheckCircle className="text-green-500 w-5 h-5" />;
      case 'NOT_MET': return <XCircle className="text-red-500 w-5 h-5" />;
      case 'PARTIALLY_MET': return <AlertTriangle className="text-yellow-500 w-5 h-5" />;
      case 'AMBIGUOUS': return <AlertTriangle className="text-gray-500 w-5 h-5" />;
    }
  };

  const getStatusColor = (status: ValidationResult['status']) => {
      switch (status) {
        case 'MET': return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800';
        case 'NOT_MET': return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border-red-200 dark:border-red-800';
        default: return 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
      }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{analysis.tenderTitle}</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <FileText className="w-4 h-4" />
            <span>ID: {analysis.id.slice(0, 8)}...</span>
            <span>•</span>
            <span>{new Date(analysis.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <button 
          onClick={onReset}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Analyze Another
        </button>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {/* Summary Status - Could be calculated from results */}
         <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
             <h3 className="text-blue-900 dark:text-blue-100 font-semibold mb-2">Analysis Status</h3>
             <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{analysis.status}</p>
         </div>
         <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
             <h3 className="text-gray-900 dark:text-gray-100 font-semibold mb-2">Requirements Found</h3>
             <p className="text-3xl font-bold text-gray-900 dark:text-white">{analysis.requirements?.length || 0}</p>
         </div>
      </div>

      {/* Validation Rules List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white px-1">Validation Report</h3>
        {analysis.results && analysis.results.length > 0 ? (
          analysis.results.map((result, idx) => (
            <div key={idx} className={`p-4 rounded-xl border ${getStatusColor(result.status)} transition-all`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">{getStatusIcon(result.status)}</div>
                  <div>
                    <h4 className="font-semibold text-lg">{result.requirementId}</h4>
                    <p className="mt-1">{result.reasoning}</p>
                    {result.evidence && (
                      <div className="mt-3 text-sm p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                        <span className="font-semibold">Evidence: </span> 
                        "{result.evidence.text}"
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xs font-mono opacity-70">
                   Confidence: {(result.confidence * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-gray-500">
             No specific validation rules were triggered or returned.
          </div>
        )}
      </div>
    </div>
  );
};
