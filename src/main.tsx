import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";

import { App } from "@/App.tsx";
import { ErrorBoundary } from "@/components";
import { DevTools } from "@/components/dev-tools";
import { ToastProvider, ToastViewport } from "@/components/ui/toast";
import { I18nProvider } from "@/i18n";
import { AppContextProvider } from "@/store/app-context";
import { ThemeProvider } from "@/styles/design-system";

import "@/styles/main.scss";
import "@/styles/design-system.css";
import "@/styles/ui.css";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const swUrl = `${import.meta.env.BASE_URL}sw.js`;
    navigator.serviceWorker.register(swUrl).catch(() => {});
  });
}

createRoot(document.getElementById("app")!).render(
  <StrictMode>
    <ErrorBoundary>
      <I18nProvider>
        <BrowserRouter>
          <ThemeProvider>
            <ToastProvider>
              <AppContextProvider>
                <Routes>
                  <Route path="*" element={<App />} />
                </Routes>
              </AppContextProvider>
              <ToastViewport />
            </ToastProvider>
          </ThemeProvider>
        </BrowserRouter>
      </I18nProvider>
    </ErrorBoundary>
    <DevTools />
  </StrictMode>
);
