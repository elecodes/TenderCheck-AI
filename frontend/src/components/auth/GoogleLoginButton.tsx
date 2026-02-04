import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

// Separate component to safely use the hook
import { useNavigate } from 'react-router-dom';

const LoginButtonDetails = () => {
  console.log('%c🚀 [v2.3] REDIRECT MODE INITIALIZED', 'color: emerald; font-weight: bold; font-size: 14px;');
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Handle Redirect Back from Google
  useEffect(() => {
    const handleGoogleRedirect = async () => {
        // Check for access_token in the URL fragment (Implicit flow)
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
            const params = new URLSearchParams(hash.substring(1)); // remove #
            const token = params.get('access_token');
            
            if (token) {
                console.log('✅ Google Redirect Success: Token found');
                setIsLoading(true);
                try {
                    console.log('🚀 Initiating Backend Auth with token...');
                    await loginWithGoogle(token);
                    console.log('🎉 Backend Auth Success');
                    // Clean URL
                    window.history.replaceState(null, '', window.location.pathname);
                    navigate('/dashboard');
                } catch (error) {
                    console.error('❌ Backend Auth Error:', error);
                    setIsLoading(false);
                }
            }
        }
    };
    
    handleGoogleRedirect();
  }, [loginWithGoogle, navigate]);

  const handleSuccess = async (tokenResponse: any) => {
      console.log('✅ Google SDK Success:', tokenResponse);
      if (tokenResponse.access_token) {
          setIsLoading(true);
          try {
              await loginWithGoogle(tokenResponse.access_token);
              navigate('/dashboard');
          } catch (error) {
              console.error('❌ Backend Auth Error:', error);
              setIsLoading(false);
          }
      }
  };

  const login = useGoogleLogin({
    onSuccess: handleSuccess,
    onError: (errorResponse: any) => {
      console.error('❌ Google SDK Error:', errorResponse);
      setIsLoading(false);
    },
    flow: 'implicit',
    ux_mode: 'redirect',
    redirect_uri: window.location.origin, 
    // Redirect mode is required for Render/COOP environments
  } as any);

  return (
    <button
      type="button"
      onClick={() => {
        console.log('🚀 Redirecting to Google Auth...');
        login();
      }}
      disabled={isLoading}
      className="w-full flex items-center justify-center px-4 py-3 border border-white/10 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
           <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
           <span>Autenticando...</span>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span>Continuar con Google</span>
        </div>
      )}
    </button>
  );
};

export const GoogleLoginButton = () => {
    // Only render if Client ID is present
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return null;

    return <LoginButtonDetails />;
};
