// src/main.tsx

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./components/theme-provider";

// Force dark mode on the HTML element
document.documentElement.classList.add('dark');

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="prospecting-theme">
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
