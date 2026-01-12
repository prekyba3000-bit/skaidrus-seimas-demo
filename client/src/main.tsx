import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeSentry } from "./monitoring";

// Initialize Sentry before rendering app
initializeSentry();

createRoot(document.getElementById("root")!).render(<App />);
