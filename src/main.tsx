import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Guard against unhandled cross-origin or script errors in embedded iframe
if (typeof window !== 'undefined') {
  window.onerror = function (message, source, lineno, colno, error) {
    console.warn('[Global Error Intercepted]:', message, source, lineno, colno, error);
    return true; // Prevents "Script error." bubbling to host window
  };

  window.addEventListener('error', (event) => {
    console.warn('[Global Error Intercepted]:', event.message || event);
    event.preventDefault();
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.warn('[Unhandled Rejection Intercepted]:', event.reason);
    event.preventDefault();
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
