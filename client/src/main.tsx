import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeSentry } from "./monitoring";

// Global error handler for uncaught errors - make them visible
window.addEventListener("error", (event) => {
  console.error("Uncaught error:", event.error);
  // Display error on page if root exists
  const root = document.getElementById("root");
  if (root && !root.querySelector(".error-display")) {
    root.innerHTML = `
      <div class="error-display" style="display: flex; align-items: center; justify-center; min-height: 100vh; background: #09090b; color: white; font-family: system-ui; padding: 2rem;">
        <div style="max-width: 600px; text-align: center;">
          <h1 style="color: #ef4444; margin-bottom: 1rem;">JavaScript Error</h1>
          <p style="color: #94a3b8; margin-bottom: 1rem;">${event.error?.message || "Unknown error"}</p>
          <pre style="background: #1f1f1f; padding: 1rem; border-radius: 4px; overflow: auto; text-align: left; font-size: 12px;">${event.error?.stack || "No stack trace"}</pre>
          <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
            Reload Page
          </button>
        </div>
      </div>
    `;
  }
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
  // Display error on page if root exists
  const root = document.getElementById("root");
  if (root && !root.querySelector(".error-display")) {
    root.innerHTML = `
      <div class="error-display" style="display: flex; align-items: center; justify-center; min-height: 100vh; background: #09090b; color: white; font-family: system-ui; padding: 2rem;">
        <div style="max-width: 600px; text-align: center;">
          <h1 style="color: #ef4444; margin-bottom: 1rem;">Promise Rejection</h1>
          <p style="color: #94a3b8; margin-bottom: 1rem;">${event.reason?.message || String(event.reason)}</p>
          <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
            Reload Page
          </button>
        </div>
      </div>
    `;
  }
});

// Initialize Sentry before rendering app
try {
  initializeSentry();
} catch (error) {
  console.error("Failed to initialize Sentry:", error);
}

// Render app with error boundary
const rootElement = document.getElementById("root");
if (!rootElement) {
  document.body.innerHTML = `
    <div style="display: flex; align-items: center; justify-center; min-height: 100vh; background: #09090b; color: white; font-family: system-ui;">
      <div style="text-align: center; padding: 2rem;">
        <h1 style="color: #ef4444; margin-bottom: 1rem;">Fatal Error</h1>
        <p style="color: #94a3b8;">Root element (#root) not found in DOM</p>
      </div>
    </div>
  `;
  throw new Error("Root element not found");
}

// Add a loading indicator before React mounts
rootElement.innerHTML = '<div style="display: flex; align-items: center; justify-center; min-height: 100vh; background: #09090b; color: white;"><div style="text-align: center;"><div style="width: 40px; height: 40px; border: 4px solid #3b82f6; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div><p>Loading...</p></div></div><style>@keyframes spin { to { transform: rotate(360deg); } }</style>';

try {
  createRoot(rootElement).render(<App />);
} catch (error) {
  console.error("Failed to render app:", error);
  rootElement.innerHTML = `
    <div style="display: flex; align-items: center; justify-center; min-height: 100vh; background: #09090b; color: white; font-family: system-ui;">
      <div style="text-align: center; padding: 2rem; max-width: 600px;">
        <h1 style="color: #ef4444; margin-bottom: 1rem;">Failed to initialize app</h1>
        <p style="color: #94a3b8; margin-bottom: 1rem;">${error instanceof Error ? error.message : "Unknown error"}</p>
        ${error instanceof Error && error.stack ? `<pre style="background: #1f1f1f; padding: 1rem; border-radius: 4px; overflow: auto; text-align: left; font-size: 12px; margin-bottom: 1rem;">${error.stack}</pre>` : ''}
        <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
          Reload Page
        </button>
      </div>
    </div>
  `;
}
