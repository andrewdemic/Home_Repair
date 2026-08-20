import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Loader2, Home } from 'lucide-react';
import { AuthProvider, useAuth } from '@/lib/auth';
import AuthPage from '@/components/AuthPage';
import App from './App.tsx';
import './index.css';

function Root() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-stone-100">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-900 text-white">
          <Home size={22} />
        </div>
        <Loader2 size={24} className="animate-spin text-stone-400" />
      </div>
    );
  }

  if (!session) return <AuthPage />;
  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </StrictMode>
);
