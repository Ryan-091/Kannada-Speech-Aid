import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set API base URL for production
(window as any).__API_BASE_URL__ = import.meta.env.VITE_API_URL || "http://localhost:3000";

createRoot(document.getElementById("root")!).render(<App />);