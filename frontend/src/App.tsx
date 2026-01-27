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
            <div className="min-h-screen flex items-center justify-center p-4 bg-brand-dark bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-brand-dark to-brand-dark">
              <LoginForm />
            </div>
          } />
          <Route path="/register" element={
            <div className="min-h-screen flex items-center justify-center p-4 bg-brand-dark bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-brand-dark to-brand-dark">
              <RegisterForm />
            </div>
          } />
          <Route path="/forgot-password" element={
            <div className="min-h-screen flex items-center justify-center p-4 bg-brand-dark bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-brand-dark to-brand-dark">
              <ForgotPasswordForm />
            </div>
          } />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
