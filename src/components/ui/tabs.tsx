import { createContext, HTMLAttributes, ReactNode, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from "react";

import { cn } from "@/utils/cn";

type TabsContextValue = {
  value: string;
  setValue: (next: string) => void;
  registerTab: (tabValue: string) => () => void;
  order: React.MutableRefObject<string[]>;
  baseId: string;
};

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

function useTabsContext(component: string): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error(`${component} must be used within <Tabs>`);
  }
  return ctx;
}

export interface TabsProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
}

export function Tabs({ value: controlledValue, defaultValue, onValueChange, children }: TabsProps) {
  const [internalValue, setInternalValue] = useState<string>(defaultValue ?? "");
  const order = useRef<string[]>([]);
  const baseId = useId();

  const setValue = useCallback(
    (next: string) => {
      if (!next || next === (controlledValue ?? internalValue)) return;
      if (controlledValue === undefined) {
        setInternalValue(next);
      }
      onValueChange?.(next);
    },
    [controlledValue, internalValue, onValueChange]
  );

  const registerTab = useCallback((tabValue: string) => {
    if (!order.current.includes(tabValue)) {
      order.current = [...order.current, tabValue];
    }

    const currentValue = controlledValue ?? internalValue;
    if (!currentValue) {
      if (controlledValue === undefined) {
        setInternalValue(tabValue);
      } else {
        onValueChange?.(tabValue);
      }
    }

    return () => {
      order.current = order.current.filter((value) => value !== tabValue);
    };
  }, [controlledValue, internalValue, onValueChange, setInternalValue]);

  const context = useMemo<TabsContextValue>(() => ({
    value: controlledValue ?? internalValue,
    setValue,
    registerTab,
    order,
    baseId,
  }), [baseId, controlledValue, internalValue, registerTab, setValue]);

  return <TabsContext.Provider value={context}>{children}</TabsContext.Provider>;
}

export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function TabsList({ className, children, ...rest }: TabsListProps) {
  return (
    <div role="tablist" className={cn("pps-tablist", className)} {...rest}>
      {children}
    </div>
  );
}

export interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabsTrigger({ value, children, className }: TabsTriggerProps) {
  const { value: activeValue, setValue, registerTab, order, baseId } = useTabsContext("TabsTrigger");
  const tabId = `${baseId}-tab-${value}`;
  const panelId = `${baseId}-panel-${value}`;

  useEffect(() => {
    return registerTab(value);
  }, [registerTab, value]);

  const handleKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (event) => {
    if (!order.current.length) return;
    const currentIndex = order.current.indexOf(value);
    if (currentIndex === -1) return;
    let nextIndex = currentIndex;
    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % order.current.length;
      setValue(order.current[nextIndex]!);
      event.preventDefault();
    } else if (event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + order.current.length) % order.current.length;
      setValue(order.current[nextIndex]!);
      event.preventDefault();
    }
  };

  return (
    <button
      id={tabId}
      role="tab"
      type="button"
      aria-selected={activeValue === value}
      aria-controls={panelId}
      className={cn("pps-tab", className)}
      data-active={activeValue === value || undefined}
      onClick={() => setValue(value)}
      onKeyDown={handleKeyDown}
    >
      {children}
    </button>
  );
}

export interface TabsPanelProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabsPanel({ value, children, className }: TabsPanelProps) {
  const { value: activeValue, baseId } = useTabsContext("TabsPanel");
  const panelId = `${baseId}-panel-${value}`;
  const tabId = `${baseId}-tab-${value}`;
  const isActive = activeValue === value;

  return (
    <div
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      hidden={!isActive}
      aria-hidden={!isActive}
      className={cn("pps-stack", className)}
    >
      {children}
    </div>
  );
}

