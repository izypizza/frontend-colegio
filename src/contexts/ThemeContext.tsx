"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type FontSize = "small" | "normal" | "large";
export type ThemeMode = "light" | "dark";

interface ThemeContextType {
  fontSize: FontSize;
  screenReader: boolean;
  theme: ThemeMode;
  setFontSize: (size: FontSize) => void;
  setScreenReader: (enabled: boolean) => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [fontSize, setFontSizeState] = useState<FontSize>("normal");
  const [screenReader, setScreenReaderState] = useState(false);
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  // Cargar preferencias del localStorage al montar
  useEffect(() => {
    const savedFontSize = localStorage.getItem("font-size") as FontSize;
    const savedScreenReader = localStorage.getItem("screen-reader") === "true";
    const savedTheme = (localStorage.getItem("theme") as ThemeMode) || "light";

    if (savedFontSize) setFontSizeState(savedFontSize);
    if (savedScreenReader) setScreenReaderState(savedScreenReader);
    if (savedTheme) setThemeState(savedTheme);

    setMounted(true);
  }, []);

  // Aplicar tema al documento
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    // Remover clases anteriores
    root.classList.remove(
      "font-small",
      "font-normal",
      "font-large",
      "screen-reader",
      "dark",
    );

    // Aplicar tamaño de fuente
    root.classList.add(`font-${fontSize}`);

    // Aplicar optimización para lector de pantalla
    if (screenReader) {
      root.classList.add("screen-reader");
    }

    if (theme === "dark") {
      root.classList.add("dark");
    }
  }, [fontSize, screenReader, theme, mounted]);

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
    localStorage.setItem("font-size", size);
  };

  const setScreenReader = (enabled: boolean) => {
    setScreenReaderState(enabled);
    localStorage.setItem("screen-reader", enabled.toString());
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem("theme", mode);
  };

  // Evitar flash de tema incorrecto
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        fontSize,
        screenReader,
        theme,
        setFontSize,
        setScreenReader,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
