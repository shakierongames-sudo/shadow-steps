import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { registerServiceWorker } from "./registerServiceWorker.js";
import { VisualIdentityLayer } from "./visualIdentity.jsx";
import "./styles.css";
import "./visualIdentity.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <VisualIdentityLayer />
    <App />
  </StrictMode>,
);

registerServiceWorker();
