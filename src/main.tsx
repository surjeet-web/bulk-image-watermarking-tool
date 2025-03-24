import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { useLenis } from './hooks/useLenis';
import { ToastProvider } from './components/ui/toast';

function Root() {
  useLenis();
  
  return (
    <StrictMode>
      <ToastProvider>
        <App />
      </ToastProvider>
    </StrictMode>
  );
}

createRoot(document.getElementById('root')!).render(<Root />);