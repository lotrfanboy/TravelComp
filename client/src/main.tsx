import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/auth-animations.css";
import "./i18n"; // Importando a configuração do i18n

// Create a root element and render the application
const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(<App />);
