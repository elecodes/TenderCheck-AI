import { Routes, Route } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { Dashboard } from './components/dashboard/Dashboard'
import { LoginForm } from './components/auth/LoginForm'
import { RegisterForm } from './components/auth/RegisterForm'
import './App.css'

function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={
          <div className="min-h-screen flex items-center justify-center p-4 bg-brand-dark bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-brand-dark to-brand-dark">
            <LoginForm />
          </div>
        } />
        <Route path="/register" element={
          <div className="min-h-screen flex items-center justify-center p-4 bg-brand-dark bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-brand-dark to-brand-dark">
            <RegisterForm />
          </div>
        } />
      </Routes>
    </div>
  )
}

export default App
