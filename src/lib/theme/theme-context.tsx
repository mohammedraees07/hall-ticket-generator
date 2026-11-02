"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";

export type ThemeMode = "light" | "dark";
export type ThemePreference = "light" | "dark" | "system";

interface ThemeContextType {
  theme: ThemeMode;
  preference: ThemePreference;
  setPreference: (pref: ThemePreference) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  preference: "dark",
  setPreference: () => {},
  toggleTheme: () => {},
});

const THEME_STORAGE_KEY = "hallticket-theme-pref";

function getSystemTheme(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyThemeToDocument(pref: ThemePreference): ThemeMode {
  if (typeof document === "undefined") return "dark";
  const resolved: ThemeMode = pref === "system" ? getSystemTheme() : pref;
  const root = document.documentElement;

  if (resolved === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
    root.style.colorScheme = "dark";
  } else {
    root.classList.remove("dark");
    root.classList.add("light");
    root.style.colorScheme = "light";
  }

  return resolved;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>("dark");
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const prefRef = useRef<ThemePreference>("dark");

  const apply = useCallback(() => {
    const resolved = applyThemeToDocument(prefRef.current);
    setTheme(resolved);
  }, []);

  useEffect(() => {
    let saved: ThemePreference = "dark";
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemePreference;
      if (stored === "light" || stored === "dark" || stored === "system") {
        saved = stored;
      }
    } catch {}

    prefRef.current = saved;
    setPreferenceState(saved);
    apply();

    // Listen for system preference changes when on "system"
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => {
      if (prefRef.current === "system") {
        apply();
      }
    };

    // Cross-tab sync
    const onStorageChange = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && e.newValue) {
        const next = e.newValue as ThemePreference;
        if (next === "light" || next === "dark" || next === "system") {
          prefRef.current = next;
          setPreferenceState(next);
          apply();
        }
      }
    };

    mql.addEventListener?.("change", onSystemChange);
    window.addEventListener("storage", onStorageChange);

    return () => {
      mql.removeEventListener?.("change", onSystemChange);
      window.removeEventListener("storage", onStorageChange);
    };
  }, [apply]);

  const setPreference = useCallback(
    (pref: ThemePreference) => {
      prefRef.current = pref;
      setPreferenceState(pref);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, pref);
      } catch {}
      apply();
    },
    [apply]
  );

  const toggleTheme = useCallback(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setPreference(isDark ? "light" : "dark");
  }, [setPreference]);

  return (
    <ThemeContext.Provider value={{ theme, preference, setPreference, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

