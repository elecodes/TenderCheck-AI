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
            <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#D3D0C2] bg-gradient-to-br from-[#E8E6DE] via-[#D3D0C2] to-[#B8C1B7] dark:bg-[#1a1f24] dark:bg-gradient-to-br dark:from-[#3a4450] dark:via-[#242b33] dark:to-[#1a1f24] relative overflow-hidden transition-colors duration-500">
                <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-[#C5A028]/5 rounded-full blur-[150px] pointer-events-none mix-blend-multiply dark:mix-blend-screen animate-float" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-[#C5A028]/5 rounded-full blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-screen animate-float" style={{ animationDelay: '-3s' }} />
                <LoginForm />
            </div>
          } />
          <Route path="/register" element={
            <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#D3D0C2] bg-gradient-to-br from-[#E8E6DE] via-[#D3D0C2] to-[#B8C1B7] dark:bg-[#1a1f24] dark:bg-gradient-to-br dark:from-[#3a4450] dark:via-[#242b33] dark:to-[#1a1f24] relative overflow-hidden transition-colors duration-500">
                <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-[#C5A028]/5 rounded-full blur-[150px] pointer-events-none mix-blend-multiply dark:mix-blend-screen animate-float" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-[#C5A028]/5 rounded-full blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-screen animate-float" style={{ animationDelay: '-3s' }} />
                <RegisterForm />
            </div>
          } />
          <Route path="/forgot-password" element={
            <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#D3D0C2] bg-gradient-to-br from-[#E8E6DE] via-[#D3D0C2] to-[#B8C1B7] dark:bg-[#1a1f24] dark:bg-gradient-to-br dark:from-[#3a4450] dark:via-[#242b33] dark:to-[#1a1f24] relative overflow-hidden transition-colors duration-500">
                <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-[#C5A028]/5 rounded-full blur-[150px] pointer-events-none mix-blend-multiply dark:mix-blend-screen animate-float" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-[#C5A028]/5 rounded-full blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-screen animate-float" style={{ animationDelay: '-3s' }} />
                <ForgotPasswordForm />
            </div>
          } />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
