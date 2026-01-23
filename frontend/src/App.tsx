import { useState } from 'react'
import { SentryErrorBoundary } from './components/ui/SentryErrorBoundary'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <SentryErrorBoundary>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">TenderCheck AI</h1>
        <div className="card p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full text-center">
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            Sube tus pliegos para validar requisitos automáticamente.
          </p>
          
          <button 
             className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors focus:ring-4 focus:ring-blue-300 focus:outline-none"
             onClick={() => setCount((c) => c + 1)}
             aria-label="Iniciar análisis de documentos de licitación"
          >
            {count === 0 ? "Analizar Documentos" : `Análisis #${count} Iniciado`}
          </button>

          {count > 0 && (
            <div role="status" aria-live="polite" className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md">
              <p className="text-sm text-blue-800 dark:text-blue-200 animate-pulse">
                🔍 Escaneando requisitos técnicos...
              </p>
            </div>
          )}
        </div>
      </div>
    </SentryErrorBoundary>
  )
}

export default App
