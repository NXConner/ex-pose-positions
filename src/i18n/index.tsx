import { createContext, ReactNode, useContext, useMemo, useState } from "react";

type Dict = Record<string, string>;

const enUS: Dict = {
  app_title: 'Random Sex Position',
  partner_connection: 'Partner Connection',
  tonight: "Tonight",
  send_plan: 'Send Plan',
};

type I18nContextType = {
  t: (key: string) => string;
  locale: string;
  setLocale: (l: string) => void;
};

const I18nContext = createContext<I18nContextType>({ t: (k) => k, locale: 'en-US', setLocale: () => {} });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState('en-US');
  const dict = enUS; // extendable later
  const value = useMemo(() => ({
    t: (key: string) => dict[key] ?? key,
    locale,
    setLocale,
  }), [locale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() { return useContext(I18nContext); }

