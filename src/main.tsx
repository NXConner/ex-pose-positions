import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";

import { App } from "@/App.tsx";
import { ErrorBoundary } from "@/components";
import { I18nProvider } from "@/i18n";
import { AppContextProvider } from "@/store/app-context";
import { DevTools } from "@/components/dev-tools";

import "@/styles/main.scss";

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
        <AppContextProvider>
          <BrowserRouter>
            <Routes>
              <Route path="*" element={<App />} />
            </Routes>
          </BrowserRouter>
        </AppContextProvider>
      </I18nProvider>
    </ErrorBoundary>
    <DevTools />
  </StrictMode>
);
