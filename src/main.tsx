import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global Error Catching for logging
window.onerror = (message, source, lineno, colno, error) => {
  console.error("[GLOBAL_ERROR]", { message, source, lineno, colno, error });
};

window.onunhandledrejection = (event) => {
  console.error("[UNHANDLED_REJECTION]", event.reason);
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
