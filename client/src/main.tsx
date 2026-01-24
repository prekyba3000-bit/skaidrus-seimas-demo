/**
 * HTML escaping utility to prevent XSS attacks
 */
function escapeHtml(text: string | undefined | null): string {
  if (text == null) return "";
  const div = document.createElement("div");
  div.textContent = String(text);
  return div.innerHTML;
}

/**
 * Safely set text content of an element (prevents XSS)
 */
function setTextContent(element: HTMLElement, text: string | undefined | null): void {
  element.textContent = text == null ? "" : String(text);
}

// DEBUG: Log that script is executing
console.log("[DEBUG] main.tsx: Script is executing");
console.log("[DEBUG] main.tsx: Document ready state:", document.readyState);
console.log("[DEBUG] main.tsx: Root element exists:", !!document.getElementById("root"));

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeSentry } from "./monitoring";

console.log("[DEBUG] main.tsx: Imports loaded successfully");

// Global error handler for uncaught errors - make them visible
window.addEventListener("error", (event) => {
  console.error("Uncaught error:", event.error);
  // Display error on page if root exists
  const root = document.getElementById("root");
  if (root && !root.querySelector(".error-display")) {
    // Use textContent and createElement to prevent XSS
    root.innerHTML = ""; // Clear first
    const container = document.createElement("div");
    container.className = "error-display";
    container.style.cssText = "display: flex; align-items: center; justify-center; min-height: 100vh; background: #09090b; color: white; font-family: system-ui; padding: 2rem;";
    
    const content = document.createElement("div");
    content.style.cssText = "max-width: 600px; text-align: center;";
    
    const title = document.createElement("h1");
    title.style.cssText = "color: #ef4444; margin-bottom: 1rem;";
    setTextContent(title, "JavaScript Error");
    
    const message = document.createElement("p");
    message.style.cssText = "color: #94a3b8; margin-bottom: 1rem;";
    setTextContent(message, event.error?.message || "Unknown error");
    
    const stack = document.createElement("pre");
    stack.style.cssText = "background: #1f1f1f; padding: 1rem; border-radius: 4px; overflow: auto; text-align: left; font-size: 12px;";
    setTextContent(stack, event.error?.stack || "No stack trace");
    
    const button = document.createElement("button");
    button.style.cssText = "margin-top: 1rem; padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer;";
    setTextContent(button, "Reload Page");
    button.onclick = () => window.location.reload();
    
    content.appendChild(title);
    content.appendChild(message);
    content.appendChild(stack);
    content.appendChild(button);
    container.appendChild(content);
    root.appendChild(container);
  }
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
  // Display error on page if root exists
  const root = document.getElementById("root");
  if (root && !root.querySelector(".error-display")) {
    // Use textContent and createElement to prevent XSS
    root.innerHTML = ""; // Clear first
    const container = document.createElement("div");
    container.className = "error-display";
    container.style.cssText = "display: flex; align-items: center; justify-center; min-height: 100vh; background: #09090b; color: white; font-family: system-ui; padding: 2rem;";
    
    const content = document.createElement("div");
    content.style.cssText = "max-width: 600px; text-align: center;";
    
    const title = document.createElement("h1");
    title.style.cssText = "color: #ef4444; margin-bottom: 1rem;";
    setTextContent(title, "Promise Rejection");
    
    const message = document.createElement("p");
    message.style.cssText = "color: #94a3b8; margin-bottom: 1rem;";
    const reasonText = event.reason?.message || String(event.reason);
    setTextContent(message, reasonText);
    
    const button = document.createElement("button");
    button.style.cssText = "margin-top: 1rem; padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer;";
    setTextContent(button, "Reload Page");
    button.onclick = () => window.location.reload();
    
    content.appendChild(title);
    content.appendChild(message);
    content.appendChild(button);
    container.appendChild(content);
    root.appendChild(container);
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
  // Use textContent to prevent XSS
  document.body.innerHTML = "";
  const container = document.createElement("div");
  container.style.cssText = "display: flex; align-items: center; justify-center; min-height: 100vh; background: #09090b; color: white; font-family: system-ui;";
  
  const content = document.createElement("div");
  content.style.cssText = "text-align: center; padding: 2rem;";
  
  const title = document.createElement("h1");
  title.style.cssText = "color: #ef4444; margin-bottom: 1rem;";
  setTextContent(title, "Fatal Error");
  
  const message = document.createElement("p");
  message.style.cssText = "color: #94a3b8;";
  setTextContent(message, "Root element (#root) not found in DOM");
  
  content.appendChild(title);
  content.appendChild(message);
  container.appendChild(content);
  document.body.appendChild(container);
  
  throw new Error("Root element not found");
}

// Add a loading indicator before React mounts (safe - no user input)
rootElement.innerHTML = '<div style="display: flex; align-items: center; justify-center; min-height: 100vh; background: #09090b; color: white;"><div style="text-align: center;"><div style="width: 40px; height: 40px; border: 4px solid #3b82f6; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div><p>Loading...</p></div></div><style>@keyframes spin { to { transform: rotate(360deg); } }</style>';

try {
  console.log("[DEBUG] main.tsx: About to create React root");
  createRoot(rootElement).render(<App />);
  console.log("[DEBUG] main.tsx: React root created and App rendered");
} catch (error) {
  console.error("[DEBUG] main.tsx: Failed to render app:", error);
  // Use textContent and createElement to prevent XSS
  rootElement.innerHTML = ""; // Clear first
  const container = document.createElement("div");
  container.style.cssText = "display: flex; align-items: center; justify-center; min-height: 100vh; background: #09090b; color: white; font-family: system-ui;";
  
  const content = document.createElement("div");
  content.style.cssText = "text-align: center; padding: 2rem; max-width: 600px;";
  
  const title = document.createElement("h1");
  title.style.cssText = "color: #ef4444; margin-bottom: 1rem;";
  setTextContent(title, "Failed to initialize app");
  
  const message = document.createElement("p");
  message.style.cssText = "color: #94a3b8; margin-bottom: 1rem;";
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  setTextContent(message, errorMessage);
  
  const stack = document.createElement("pre");
  if (error instanceof Error && error.stack) {
    stack.style.cssText = "background: #1f1f1f; padding: 1rem; border-radius: 4px; overflow: auto; text-align: left; font-size: 12px; margin-bottom: 1rem;";
    setTextContent(stack, error.stack);
  }
  
  const button = document.createElement("button");
  button.style.cssText = "padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer;";
  setTextContent(button, "Reload Page");
  button.onclick = () => window.location.reload();
  
  content.appendChild(title);
  content.appendChild(message);
  if (error instanceof Error && error.stack) {
    content.appendChild(stack);
  }
  content.appendChild(button);
  container.appendChild(content);
  rootElement.appendChild(container);
}
