import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { isWebDemo } from "./lib/env";
import "./styles/globals.css";

if (isWebDemo && typeof document !== "undefined") {
  document.body.classList.add("lexis-demo");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
