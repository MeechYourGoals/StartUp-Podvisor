import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeNativePlugins, handleBackButton } from "./lib/capacitor";

// Initialize native plugins
initializeNativePlugins();
handleBackButton();

createRoot(document.getElementById("root")!).render(<App />);
