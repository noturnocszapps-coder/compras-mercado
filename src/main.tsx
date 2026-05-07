import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { SAFE_MODE } from './config/features';

console.log("[BOOT_STAGE] main.tsx executing...");
console.log("[BOOT_STAGE] SAFE_MODE:", SAFE_MODE);
console.log("[BOOT_STAGE] Current URL:", window.location.href);

// Define a function to render the "Panic Screen"
const renderPanicScreen = (message: string, error?: any, source?: string) => {
  const rootDiv = document.getElementById('root');
  if (rootDiv) {
    rootDiv.innerHTML = `
      <div style="font-family: 'Inter', sans-serif; padding: 40px; text-align: center; background: #fff1f2; min-height: 100vh; color: #1e293b;">
        <div style="max-width: 800px; margin: 0 auto; background: white; padding: 32px; border-radius: 24px; border: 2px solid #fecdd3; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);">
          <h1 style="color: #be123c; font-size: 24px; font-weight: 900; margin-bottom: 8px; text-transform: uppercase; letter-spacing: -0.02em;">
            SAFE MODE: ERRO CRÍTICO
          </h1>
          <p style="color: #64748b; font-weight: 500; margin-bottom: 24px;">
            O app travou antes da renderização. Veja os detalhes técnicos abaixo:
          </p>
          
          <div style="background: #0f172a; color: #34d399; padding: 20px; border-radius: 12px; text-align: left; overflow: auto; font-family: monospace; font-size: 14px; line-height: 1.5; margin-bottom: 24px;">
            <div style="color: #f43f5e; font-weight: bold; margin-bottom: 8px;">Mensagem: ${message}</div>
            <div style="color: #94a3b8;">Fonte: ${source || 'Desconhecida'}</div>
            <pre style="margin-top: 10px; color: #cbd5e1; white-space: pre-wrap;">${error?.stack || JSON.stringify(error, null, 2)}</pre>
          </div>

          <div style="display: flex; gap: 12px; justify-content: center;">
            <button onclick="window.location.reload()" style="background: #be123c; color: white; border: none; padding: 14px 28px; border-radius: 12px; cursor: pointer; font-weight: 800; font-size: 14px; text-transform: uppercase;">
              Recarregar App
            </button>
            <button onclick="localStorage.clear(); window.location.reload();" style="background: #f1f5f9; color: #475569; border: none; padding: 14px 28px; border-radius: 12px; cursor: pointer; font-weight: 800; font-size: 14px; text-transform: uppercase;">
              Limpar Cache e Sair
            </button>
          </div>
          
          <p style="margin-top: 24px; font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">
            Compra Fácil Safe Diagnóstico v1.0
          </p>
        </div>
      </div>
    `;
  }
};

// Global Error Catching
window.onerror = (message, source, lineno, colno, error) => {
  console.error("[CRITICAL_ERROR]", { message, source, lineno, colno, error });
  renderPanicScreen(String(message), error, `${source}:${lineno}:${colno}`);
};

window.onunhandledrejection = (event) => {
  console.error("[UNHANDLED_REJECTION]", event.reason);
  renderPanicScreen("Promessa Rejeitada (Unhandled Rejection)", event.reason);
};

try {
  console.log("[BOOT_STAGE] Initializing React Root...");
  const container = document.getElementById('root');
  if (!container) throw new Error("Root container (#root) not found in DOM");
  
  const root = createRoot(container);
  
  console.log("[BOOT_STAGE] Rendering <App />...");
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  console.log("[BOOT_STAGE] React render call triggered.");
} catch (error) {
  console.error("[BOOT_CRITICAL_FAILURE]", error);
  renderPanicScreen("Falha na inicialização do React", error);
}
