import { Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { ForgotPasswordForm } from './components/auth/ForgotPasswordForm';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/login" element={
            <div className="min-h-screen w-full flex items-center justify-center p-4 bg-brand-crema bg-gradient-to-br from-brand-crema-light via-brand-crema to-brand-crema-dark dark:bg-brand-charcoal dark:bg-gradient-to-br dark:from-[#3a4450] dark:via-[#242b33] dark:to-[#1a1f24] relative overflow-hidden transition-colors duration-500">
                <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05] dark:bg-bottom dark:border-b dark:border-slate-100/5 -z-10" style={{ maskImage: 'linear-gradient(to bottom, transparent, black)' }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-brand-crema via-transparent to-transparent dark:from-brand-charcoal -z-10"></div>
                <LoginForm />
            </div>
          } />
          <Route path="/register" element={
            <div className="min-h-screen w-full flex items-center justify-center p-4 bg-brand-crema bg-gradient-to-br from-brand-crema-light via-brand-crema to-brand-crema-dark dark:bg-brand-charcoal dark:bg-gradient-to-br dark:from-[#3a4450] dark:via-[#242b33] dark:to-[#1a1f24] relative overflow-hidden transition-colors duration-500">
                <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05] dark:bg-bottom dark:border-b dark:border-slate-100/5 -z-10" style={{ maskImage: 'linear-gradient(to bottom, transparent, black)' }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-brand-crema via-transparent to-transparent dark:from-brand-charcoal -z-10"></div>
                <RegisterForm />
            </div>
          } />
          <Route path="/forgot-password" element={
            <div className="min-h-screen w-full flex items-center justify-center p-4 bg-brand-crema bg-gradient-to-br from-brand-crema-light via-brand-crema to-brand-crema-dark dark:bg-brand-charcoal dark:bg-gradient-to-br dark:from-[#3a4450] dark:via-[#242b33] dark:to-[#1a1f24] relative overflow-hidden transition-colors duration-500">
                <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05] dark:bg-bottom dark:border-b dark:border-slate-100/5 -z-10" style={{ maskImage: 'linear-gradient(to bottom, transparent, black)' }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-brand-crema via-transparent to-transparent dark:from-brand-charcoal -z-10"></div>
                <ForgotPasswordForm />
            </div>
          } />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
