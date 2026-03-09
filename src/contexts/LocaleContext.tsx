"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  type LocaleId,
  type LocaleConfig,
  DEFAULT_LOCALE_ID,
  getLocaleConfig,
  isSupportedLocale,
  SUPPORTED_LOCALES,
} from "@/lib/locale";

const STORAGE_KEY = "wealthtracker-locale";

interface LocaleContextValue {
  localeId: LocaleId;
  locale: LocaleConfig;
  setLocaleId: (id: LocaleId) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function detectBrowserLocale(): LocaleId {
  if (typeof navigator === "undefined") return DEFAULT_LOCALE_ID;
  const preferred = navigator.language || (navigator as Navigator & { userLanguage?: string }).userLanguage;
  const resolved = isSupportedLocale(preferred ?? "");
  return resolved ?? DEFAULT_LOCALE_ID;
}

function readStoredLocale(): LocaleId | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw && SUPPORTED_LOCALES.includes(raw as LocaleId)) return raw as LocaleId;
  } catch {
    // ignore
  }
  return null;
}

function writeStoredLocale(id: LocaleId): void {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // ignore
  }
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [localeId, setLocaleIdState] = useState<LocaleId>(DEFAULT_LOCALE_ID);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = readStoredLocale();
    const detected = detectBrowserLocale();
    setLocaleIdState(stored ?? detected);
    if (!stored) writeStoredLocale(detected);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const config = getLocaleConfig(localeId);
    document.documentElement.lang = config.lang;
  }, [localeId]);

  const setLocaleId = useCallback((id: LocaleId) => {
    setLocaleIdState(id);
    writeStoredLocale(id);
  }, []);

  const value = useMemo<LocaleContextValue>(() => ({
    localeId,
    locale: getLocaleConfig(localeId),
    setLocaleId,
  }), [localeId, setLocaleId]);

  return (
    <LocaleContext.Provider value={value}>
      {children}
      {mounted && (
        <LocaleSwitcher
          currentId={localeId}
          onSelect={setLocaleId}
        />
      )}
    </LocaleContext.Provider>
  );
}

function LocaleSwitcher({
  currentId,
  onSelect,
}: {
  currentId: LocaleId;
  onSelect: (id: LocaleId) => void;
}) {
  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex gap-1 rounded-full border border-zinc-200 bg-white/95 px-1 py-1 shadow-lg backdrop-blur sm:bottom-6 sm:right-6"
      aria-label="Switch currency and region"
    >
      {SUPPORTED_LOCALES.map((id) => {
        const config = getLocaleConfig(id);
        const isActive = currentId === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              isActive
                ? "bg-zinc-900 text-white"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
            title={id === "en-GB" ? "UK (GBP)" : "US (USD)"}
          >
            {config.currency}
          </button>
        );
      })}
    </div>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
