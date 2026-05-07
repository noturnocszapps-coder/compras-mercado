import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log("[BOOT] main.tsx executing...");

try {
  const container = document.getElementById('root');
  if (!container) throw new Error("Root container not found");
  
  console.log("[BOOT] Creating React root...");
  const root = createRoot(container);
  
  console.log("[BOOT] Rendering App...");
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  console.log("[BOOT] Initial render call complete.");
} catch (error) {
  console.error("[BOOT_CRITICAL_FAILURE]", error);
  const rootDiv = document.getElementById('root');
  if (rootDiv) {
    rootDiv.innerHTML = `
      <div style="font-family: sans-serif; padding: 20px; text-align: center;">
        <h1 style="color: #ef4444;">Erro na inicialização</h1>
        <p>Houve um problema ao carregar o aplicativo. Por favor, tente recarregar ou limpe o cache.</p>
        <pre style="background: #f1f5f9; padding: 10px; border-radius: 8px; text-align: left; overflow: auto;">${error}</pre>
      </div>
    `;
  }
}
