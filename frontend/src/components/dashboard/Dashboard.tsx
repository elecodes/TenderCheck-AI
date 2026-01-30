import { useState, useEffect } from 'react'
import { SentryErrorBoundary } from '../ui/SentryErrorBoundary'
import { TenderUpload } from './TenderUpload'
import { AnalysisResults } from './AnalysisResults'
import { ComparisonResults } from './ComparisonResults'
import { ValidationSummary } from './ValidationSummary'
import { HistorySidebar } from './HistorySidebar'
import { uploadTender, validateProposal, fetchHistory, deleteTender } from '../../services/api'
import { getCurrentUser, logout as logoutService } from '../../services/auth.service'
import type { TenderAnalysis, ValidationResult } from '../../types'
import { FileText, ArrowRight, Play, LogOut, User as UserIcon, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const Dashboard = () => {
  const navigate = useNavigate()
  const user = getCurrentUser()

  // Dashboard State
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isComparing, setIsComparing] = useState(false)
  const [analysis, setAnalysis] = useState<TenderAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedProposal, setSelectedProposal] = useState<File | null>(null)
  const [comparisonResults, setComparisonResults] = useState<ValidationResult[] | null>(null)
  const [history, setHistory] = useState<TenderAnalysis[]>([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  
  // Load history on mount
  useEffect(() => {
    const loadHistory = async () => {
        try {
            const data = await fetchHistory();
            setHistory(data);
        } catch (err) {
            console.error("Failed to load history:", err);
        }
    };
    loadHistory();
  }, []);

  const handleLogout = () => {
    logoutService()
    navigate('/')
  }

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setError(null)
  }

  const handleProposalSelect = (file: File) => {
    setSelectedProposal(file)
    setError(null)
  }

  const handleStartAnalysis = async () => {
    if (!selectedFile) return
    setIsAnalyzing(true)
    setError(null)
    try {
      // 1. Analyze the Pliego
      const analysisResult = await uploadTender(selectedFile)
      setAnalysis(analysisResult)
      
      // 2. If a proposal was already selected, run comparison automatically
      if (selectedProposal) {
        setIsComparing(true)
        try {
          const { results } = await validateProposal(analysisResult.id, selectedProposal)
          setComparisonResults(results)
        } catch (compErr) {
          console.error("Auto-comparison failed:", compErr)
          // Don't block the main analysis, but maybe notify user?
          // For now, it just leaves the 'Ready to Validate' box open
        } finally {
          setIsComparing(false)
        }
      }

      const updatedHistory = await fetchHistory();
      setHistory(updatedHistory);
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleCompare = async () => {
    if (!analysis?.id || !selectedProposal) return
    setIsComparing(true)
    setError(null)
    try {
      const { results } = await validateProposal(analysis.id, selectedProposal)
      setComparisonResults(results)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsComparing(false)
    }
  }

  const handleDeleteHistory = async (id: string) => {
    try {
        await deleteTender(id);
        const updatedHistory = await fetchHistory();
        setHistory(updatedHistory);
        if (analysis?.id === id) {
            handleReset();
        }
    } catch {
        setError("Error al eliminar el historial");
    }
  }

  const handleReset = () => {
    setAnalysis(null);
    setSelectedFile(null);
    setSelectedProposal(null);
    setComparisonResults(null);
    setError(null);
  }

  return (
    <SentryErrorBoundary>
      <div className="flex flex-col h-screen bg-brand-dark bg-gradient-to-br from-[#242B33] to-[#1a1f24] text-gray-100 font-sans overflow-hidden">
        
        {/* Navbar */}
        <header className="border-b border-gray-800 bg-brand-dark/50 backdrop-blur-md z-10">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
               <button 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all mr-4 hidden lg:flex items-center space-x-2 border border-transparent hover:border-gray-700"
                  title={isSidebarOpen ? "Ocultar panel" : "Mostrar panel"}
                >
                  {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
                  <span className="text-xs font-bold uppercase tracking-widest px-1">
                    {isSidebarOpen ? "Ocultar Historial" : "Ver Historial"}
                  </span>
                </button>
               <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-md shadow-emerald-500/20">
                 <FileText className="text-white w-5 h-5" /> 
               </div>
               <span className="text-xl font-bold tracking-tight text-white">TenderCheck AI</span>
            </div>
            
            <div className="flex items-center gap-4">
               {user && (
                   <div className="hidden md:flex flex-col items-end mr-2">
                      <span className="text-sm font-medium text-gray-100">{user.name}</span>
                      <span className="text-xs text-gray-400">{user.company || 'Enterprise Account'}</span>
                   </div>
               )}
               <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <UserIcon className="w-4 h-4" />
               </div>
               <div className="h-8 w-px bg-gray-200 dark:bg-gray-800 mx-2"></div>
               <button 
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Sign out"
               >
                  <LogOut className="w-5 h-5" />
               </button>
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden h-[calc(100vh-64px)]">
          {/* History Sidebar */}
          <aside className={`flex-shrink-0 hidden lg:block transition-all duration-300 ease-in-out border-r border-gray-800/50 ${isSidebarOpen ? 'w-80 opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>
            <div className="w-80 h-full"> {/* Inner wrapper to maintain sidebar content width while transition happens */}
                <HistorySidebar 
                    history={history} 
                    onSelect={(item) => {
                        setAnalysis(item);
                        // Sync comparison results if they exist in the item
                        setComparisonResults(item.results && item.results.length > 0 ? item.results : null);
                        setSelectedFile(null);
                        setSelectedProposal(null);
                        setError(null);
                    }}
                    onDelete={handleDeleteHistory}
                    selectedId={analysis?.id}
                />
            </div>
          </aside>

          {/* Main Dashboard Area */}
          <div className="flex-1 overflow-y-auto bg-[#1a1f24]">
            <main className="max-w-5xl mx-auto px-8 py-12">
              {error && (
                <div className="mb-8 p-4 bg-red-900/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center animate-in slide-in-from-top-2 backdrop-blur-md">
                   <div className="w-2 h-2 bg-red-500 rounded-full mr-3 animate-pulse" />
                   <span className="font-semibold text-sm">Error:</span> <span className="ml-2 text-sm">{error}</span>
                </div>
              )}

              {!analysis ? (
                 <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-12 animate-in fade-in duration-700">
                    {/* Hero Section */}
                    <div className="text-center max-w-2xl space-y-6">
                       <h1 className="text-5xl font-serif font-medium tracking-tight text-gray-900 dark:text-white leading-tight">
                         Análisis Inteligente de Licitaciones
                       </h1>
                       <p className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed">
                         Sube el documento del pliego para extraer requisitos y valida tu oferta automáticamente en segundos.
                       </p>
                    </div>

                    {/* Upload Section */}
                    <div className="w-full max-w-4xl bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-2xl shadow-gray-200/50 dark:shadow-black/50 backdrop-blur-xl">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                             <div className="text-center">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Documento del Pliego</h3>
                             </div>
                             <TenderUpload 
                                onFileSelect={handleFileSelect} 
                                selectedFile={selectedFile}
                                disabled={isAnalyzing} 
                                label="Pliego"
                                variant="pliego"
                             />
                          </div>

                          <div className="space-y-4">
                             <div className="text-center">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Documento de la Oferta</h3>
                             </div>
                             <TenderUpload 
                                onFileSelect={handleProposalSelect} 
                                selectedFile={selectedProposal}
                                disabled={isAnalyzing} 
                                label="Oferta"
                                variant="oferta"
                             />
                          </div>
                       </div>

                       <div className="mt-10 flex justify-center">
                          <button
                            onClick={handleStartAnalysis}
                            disabled={!selectedFile || isAnalyzing || isComparing}
                            className={`
                              group relative px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 flex items-center space-x-2
                              ${!selectedFile || isAnalyzing || isComparing
                                 ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                                 : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-lg hover:shadow-emerald-500/25 active:scale-95'
                              }
                            `}
                          >
                            <span>
                               {isAnalyzing ? 'Analizando Pliego...' : 
                                isComparing ? 'Validando Oferta...' : 
                                selectedProposal ? 'Ejecutar Análisis Completo' : 'Analizar Pliego'}
                            </span>
                            {(!isAnalyzing && !isComparing) && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                          </button>
                       </div>
                    </div>
                 </div>
              ) : (
                <div className="space-y-12 pb-24">
                   <AnalysisResults 
                      analysis={analysis} 
                      onReset={handleReset} 
                   />

                   {/* Step 2.5: Summary Stats (if results exist) */}
                   {((analysis.results && analysis.results.length > 0) || comparisonResults) && (
                      <ValidationSummary 
                        analysis={analysis} 
                        results={comparisonResults || analysis.results || []} 
                      />
                   )}
                                     {/* Step 3: Show Compliance Results (if present) */}
                   {analysis.results && analysis.results.length > 0 && !comparisonResults && (
                      <div className="w-full max-w-4xl mx-auto">
                        <ComparisonResults results={analysis.results} analysis={analysis} />
                      </div>
                   )}

                   {comparisonResults && (
                      <div className="w-full max-w-4xl mx-auto">
                        <ComparisonResults results={comparisonResults} analysis={analysis} />
                      </div>
                   )}
                   
                   {/* Step 4: Loading state or Validation Prompt */}
                   {isComparing && (
                      <div className="w-full max-w-4xl mx-auto p-12 text-center bg-brand-dark/30 rounded-3xl border border-emerald-500/20 animate-pulse">
                         <Play className="w-12 h-12 text-emerald-500 mx-auto mb-4 animate-bounce" />
                         <h3 className="text-xl font-bold text-white">Validando Cumplimiento...</h3>
                         <p className="text-gray-500">La IA está comparando tu oferta con los requisitos extraídos.</p>
                      </div>
                   )}

                   {(!isComparing && !comparisonResults && (!analysis.results || analysis.results.filter(r => r.requirementId !== 'SCOPE_CHECK').length === 0)) && (
                       <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-xl text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
                           <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                              {selectedProposal ? 'Casi listo: Valida tu oferta' : '¿Listo para validar la oferta?'}
                           </h2>
                           <p className="text-gray-500 dark:text-gray-400 text-lg">
                               {selectedProposal 
                                 ? 'Ya tenemos el pliego analizado. Pulsa el botón para ejecutar la validación sobre el documento seleccionado.'
                                 : 'Ya has extraído los requisitos. Ahora, sube el documento de la "Oferta" para comprobar el cumplimiento.'}
                           </p>
                           
                           <div className="max-w-md mx-auto">
                               <TenderUpload 
                                    onFileSelect={handleProposalSelect} 
                                    selectedFile={selectedProposal}
                                    disabled={isComparing} 
                                    label="Subir Oferta"
                                    variant="oferta"
                               />
                           </div>

                           <button
                                onClick={handleCompare}
                                disabled={!selectedProposal || isComparing}
                                className={`
                                  mt-4 px-8 py-3 rounded-full font-semibold text-lg transition-colors flex items-center space-x-2 mx-auto
                                  ${!selectedProposal || isComparing
                                     ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                                     : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg'
                                  }
                                `}
                           >
                                {isComparing ? 'Validando...' : 'Ejecutar Comprobación'}
                                {!isComparing && <Play className="w-4 h-4 ml-2 fill-current" />}
                           </button>
                       </div>
                   )}

                   {/* Finalizar Button */}
                   {comparisonResults && (
                      <div className="flex justify-center pt-8 border-t border-gray-800/50">
                        <button
                          onClick={handleReset}
                          className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-full font-black uppercase tracking-widest transition-all active:scale-95 border border-gray-700/50 flex items-center space-x-3"
                        >
                          <LogOut className="w-5 h-5 rotate-180" />
                          <span>Finalizar y Salir</span>
                        </button>
                      </div>
                   )}
                </div>
              )}
            </main>

            <footer className="py-8 text-center text-gray-500 dark:text-gray-600 text-sm">
               &copy; 2026 TenderCheck AI. All rights reserved.
            </footer>
          </div>
        </div>
      </div>
    </SentryErrorBoundary>
  )
}
