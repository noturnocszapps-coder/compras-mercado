import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Versão do App para controle de cache
console.log("[APP_VERSION]", import.meta.env.VITE_APP_VERSION || "DEV_MODE");
console.log("[BUILD_TIME]", (window as any).__APP_BUILD__);

// Global Error Catching for logging
window.onerror = (message, source, lineno, colno, error) => {
  console.error("[GLOBAL_ERROR]", { message, source, lineno, colno, error });
};

window.onunhandledrejection = (event) => {
  console.error("[UNHANDLED_REJECTION]", {
    reason: event.reason,
    promise: event.promise,
    message: event.reason?.message || "No message"
  });
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
