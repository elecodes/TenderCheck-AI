import { useState } from 'react'
import { SentryErrorBoundary } from './components/ui/SentryErrorBoundary'
import { TenderUpload } from './components/dashboard/TenderUpload'
import { AnalysisResults } from './components/dashboard/AnalysisResults'
import { uploadTender } from './services/api'
import type { TenderAnalysis } from './types'
import { FileText, ArrowRight } from 'lucide-react'
import './App.css'

function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<TenderAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
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

  return (
    <SentryErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
        
        {/* Navbar */}
        <header className="border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-black/50 backdrop-blur-md sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-2">
               <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                 <FileText className="text-white w-5 h-5" /> 
               </div>
               <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">TenderCheck AI</span>
            </div>
            {/* Dark Mode Toggle could go here */}
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
                         />
                      </div>

                      {/* Oferta Document (Disabled for now) */}
                      <div className="space-y-4 opacity-50 pointer-events-none grayscale">
                         <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Oferta Document</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">The proposal document submitted for evaluation.</p>
                         </div>
                         <div className="h-64 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-gray-800/50">
                            <span className="text-gray-400 text-sm">Coming Soon</span>
                         </div>
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
                             : 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-white shadow-lg hover:shadow-yellow-500/25 active:scale-95'
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
            <AnalysisResults analysis={analysis} onReset={() => { setAnalysis(null); setSelectedFile(null); }} />
          )}
        </main>
        
        <footer className="py-8 text-center text-gray-500 dark:text-gray-600 text-sm">
           &copy; 2026 TenderCheck AI. All rights reserved.
        </footer>
      </div>
    </SentryErrorBoundary>
  )
}

export default App
