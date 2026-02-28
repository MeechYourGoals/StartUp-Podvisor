import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeNativePlugins, handleBackButton } from "./lib/capacitor";
import { isDespia } from "./services/despiaService";

// Initialize native plugins (Capacitor)
initializeNativePlugins();
handleBackButton();

// Log Despia runtime detection for debugging
if (isDespia()) {
  console.log('Despia: Running inside Despia native runtime');
}

createRoot(document.getElementById("root")!).render(<App />);
