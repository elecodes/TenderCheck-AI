import { useState } from 'react'
import { SentryErrorBoundary } from '../ui/SentryErrorBoundary'
import { TenderUpload } from './TenderUpload'
import { AnalysisResults } from './AnalysisResults'
import { ComparisonResults } from './ComparisonResults'
import { uploadTender, validateProposal } from '../../services/api'
import { getCurrentUser, logout as logoutService } from '../../services/auth.service'
import type { TenderAnalysis } from '../../types'
import { FileText, ArrowRight, Play, LogOut, User as UserIcon } from 'lucide-react'
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
  const [comparisonResults, setComparisonResults] = useState<any[] | null>(null)

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
      const result = await uploadTender(selectedFile)
      setAnalysis(result)
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

  return (
    <SentryErrorBoundary>
      <div className="min-h-screen bg-brand-dark bg-gradient-to-br from-[#242B33] to-[#1a1f24] text-gray-100 font-sans transition-colors duration-300">
        
        {/* Navbar */}
        <header className="border-b border-gray-800 bg-brand-dark/50 backdrop-blur-md sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
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

        <main className="max-w-7xl mx-auto px-6 py-12">
          {error && (
            <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg flex items-center animate-in slide-in-from-top-2">
               <span className="font-bold mr-2">Error:</span> {error}
            </div>
          )}

          {!analysis ? (
             <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-12 animate-in fade-in duration-700">
                {/* Hero Section */}
                <div className="text-center max-w-2xl space-y-6">
                   <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
                     Intelligent Tender Analysis
                   </h1>
                   <p className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed">
                     Upload your tender documents to automatically extract requirements and analyze compliance in seconds.
                   </p>
                </div>

                {/* Upload Section */}
                <div className="w-full max-w-5xl bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-2xl shadow-gray-200/50 dark:shadow-black/50 backdrop-blur-xl">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Pliego Document (Active) */}
                      <div className="space-y-4">
                         <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pliego Document</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">The document outlining tender requirements.</p>
                         </div>
                         <TenderUpload 
                            onFileSelect={handleFileSelect} 
                            selectedFile={selectedFile}
                            disabled={isAnalyzing} 
                            label="Pliego"
                            variant="pliego"
                         />
                      </div>

                      {/* Oferta Document (Now Active) */}
                      <div className="space-y-4">
                         <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Oferta Document</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">The proposal document submitted for evaluation.</p>
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

                   {/* Action Bar */}
                   <div className="mt-10 flex justify-center">
                      <button
                        onClick={handleStartAnalysis}
                        disabled={!selectedFile || isAnalyzing}
                        className={`
                          group relative px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 flex items-center space-x-2
                          ${!selectedFile || isAnalyzing 
                             ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed' 
                             : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-lg hover:shadow-emerald-500/25 active:scale-95'
                          }
                        `}
                      >
                        <span>{isAnalyzing ? 'Analyzing...' : 'Start Analysis'}</span>
                        {!isAnalyzing && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                      </button>
                   </div>
                </div>
             </div>
          ) : (
            <div className="space-y-12">
               {/* 1. Requirements Extraction Results */}
               <AnalysisResults analysis={analysis} onReset={() => { setAnalysis(null); setSelectedFile(null); setSelectedProposal(null); setComparisonResults(null); }} />
               
               {/* 2. Proposal Comparison Section (Option B) */}
               {!comparisonResults ? (
                   <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-xl text-center space-y-6">
                       <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ready to Validate Proposal?</h2>
                       <p className="text-gray-500 dark:text-gray-400 text-lg">
                          You have extracted the requirements. Now, upload the "Oferta" document to check for compliance.
                       </p>
                       
                       <div className="max-w-md mx-auto">
                           <TenderUpload 
                                onFileSelect={handleProposalSelect} 
                                selectedFile={selectedProposal}
                                disabled={isComparing} 
                                label="Upload Oferta"
                                variant="oferta"
                           />
                       </div>

                       <button
                            onClick={handleCompare}
                            disabled={!selectedProposal || isComparing}
                            className={`
                              mt-4 px-8 py-3 rounded-full font-semibold text-lg transition-colors flex items-center space-x-2 mx-auto
                              ${!selectedProposal || isComparing
                                 ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed' 
                                 : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg'
                              }
                            `}
                       >
                            {isComparing ? 'Comparing...' : 'Run Compliance Check'}
                            {!isComparing && <Play className="w-4 h-4 ml-2 fill-current" />}
                       </button>
                   </div>
               ) : (
                   <div className="w-full max-w-4xl mx-auto">
                       <ComparisonResults results={comparisonResults} />
                   </div>
               )}
            </div>
          )}
        </main>

        <footer className="py-8 text-center text-gray-500 dark:text-gray-600 text-sm">
           &copy; 2026 TenderCheck AI. All rights reserved.
        </footer>
      </div>
    </SentryErrorBoundary>
  )
}
