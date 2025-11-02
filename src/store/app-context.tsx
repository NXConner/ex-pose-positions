import { createContext, useContext, ReactNode, useMemo } from "react";
import { useActions as useActionsHook } from "@/hooks";
import { useShared } from "@/hooks/use-shared";

/**
 * Centralized application state context
 * Reduces prop drilling and provides global state access
 */
interface AppContextType {
  // Actions hook data
  positionId: number;
  filteredData: ReturnType<typeof useActionsHook>["filteredData"];
  activePosition: ReturnType<typeof useActionsHook>["activePosition"];
  filters: string[];
  setPositionId: (id: number) => void;
  setFilter: (level: string, isActive: boolean) => void;
  resetFilters: () => void;
  
  // Shared hook data
  me: string | null;
  partner: string;
  shared: ReturnType<typeof useShared>["shared"];
  docId: string | null;
  features: ReturnType<typeof useShared>["features"];
}

const AppContext = createContext<AppContextType | null>(null);

export function AppContextProvider({ children }: { children: ReactNode }) {
  const actions = useActionsHook();
  const shared = useShared();

  const value = useMemo(
    () => ({
      positionId: actions.positionId,
      filteredData: actions.filteredData,
      activePosition: actions.activePosition,
      filters: actions.filters,
      setPositionId: actions.setPositionId,
      setFilter: actions.setFilter,
      resetFilters: actions.resetFilters,
      me: shared.me,
      partner: shared.partner,
      shared: shared.shared,
      docId: shared.docId,
      features: shared.features,
    }),
    [actions, shared]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * Hook to access app context
 * @throws Error if used outside AppContextProvider
 */
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppContextProvider");
  }
  return context;
}

