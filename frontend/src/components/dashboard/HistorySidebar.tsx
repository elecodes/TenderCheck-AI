import type { TenderAnalysis } from "../../types";
import { Clock, FileText, ChevronRight, Search, Activity } from "lucide-react";
import { useState } from "react";

interface HistorySidebarProps {
  history: TenderAnalysis[];
  onSelect: (tender: TenderAnalysis) => void;
  selectedId?: string;
}

export const HistorySidebar = ({ history, onSelect, selectedId }: HistorySidebarProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredHistory = history.filter((item) =>
    item.tenderTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#1e242c]/80 backdrop-blur-xl border-r border-gray-800/50">
      <div className="p-6 border-b border-gray-800/50">
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center">
                <Clock className="w-4 h-4 mr-2 text-emerald-500" />
                Historial
            </h2>
            <span className="bg-emerald-500/10 text-emerald-500 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {history.length}
            </span>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="Buscar pliego..."
            className="w-full pl-10 pr-4 py-2.5 bg-brand-dark/50 border border-gray-800 rounded-xl text-sm text-gray-200 placeholder-gray-600 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pt-2">
        {filteredHistory.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-12 h-12 bg-gray-800/30 rounded-full flex items-center justify-center mx-auto">
                <Activity className="w-6 h-6 text-gray-700" />
            </div>
            <p className="text-xs text-gray-600 font-medium">No se han encontrado análisis previos.</p>
          </div>
        ) : (
          <div className="px-3 space-y-1">
            {filteredHistory.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item)}
                className={`w-full p-3.5 text-left rounded-xl transition-all duration-300 flex items-start group relative overflow-hidden ${
                  selectedId === item.id 
                    ? "bg-emerald-500/10 ring-1 ring-emerald-500/30 shadow-lg shadow-emerald-500/5" 
                    : "hover:bg-gray-800/40 border-transparent hover:border-gray-700/50"
                }`}
              >
                {/* Active Indicator */}
                {selectedId === item.id && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-r-full" />
                )}

                <div className={`p-2.5 rounded-lg mt-0.5 transition-colors ${
                    selectedId === item.id 
                        ? 'bg-emerald-500/20 shadow-inner' 
                        : 'bg-gray-800/50 group-hover:bg-gray-700/50'
                }`}>
                  <FileText className={`w-4 h-4 ${selectedId === item.id ? 'text-emerald-400' : 'text-gray-500 group-hover:text-gray-400'}`} />
                </div>
                
                <div className="ml-3 flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate transition-colors ${
                      selectedId === item.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'
                  }`}>
                    {item.tenderTitle}
                  </p>
                  <p className={`text-[11px] mt-1 font-medium ${
                      selectedId === item.id ? 'text-emerald-500/70' : 'text-gray-600'
                  }`}>
                    {new Date(item.createdAt).toLocaleDateString('es-ES', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric' 
                    })}
                  </p>
                </div>
                
                <ChevronRight className={`w-4 h-4 mt-2.5 transition-all duration-300 ${
                    selectedId === item.id 
                        ? 'text-emerald-500 opacity-100 translate-x-0' 
                        : 'text-gray-700 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
                }`} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
