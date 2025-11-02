import { ReactNode } from "react";
import { AppContextProvider } from "@/store/app-context";

/**
 * Wrapper component that ensures AppContextProvider is inside Router context
 * This must be rendered inside a Route element (which is inside BrowserRouter)
 */
export function AppWrapper({ children }: { children: ReactNode }) {
  return (
    <AppContextProvider>
      {children}
    </AppContextProvider>
  );
}

