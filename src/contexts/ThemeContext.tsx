"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type FontSize = "small" | "normal" | "large";

interface ThemeContextType {
  fontSize: FontSize;
  screenReader: boolean;
  setFontSize: (size: FontSize) => void;
  setScreenReader: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [fontSize, setFontSizeState] = useState<FontSize>("normal");
  const [screenReader, setScreenReaderState] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Cargar preferencias del localStorage al montar
  useEffect(() => {
    const savedFontSize = localStorage.getItem("font-size") as FontSize;
    const savedScreenReader = localStorage.getItem("screen-reader") === "true";

    if (savedFontSize) setFontSizeState(savedFontSize);
    if (savedScreenReader) setScreenReaderState(savedScreenReader);

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
      "screen-reader"
    );

    // Aplicar tamaño de fuente
    root.classList.add(`font-${fontSize}`);

    // Aplicar optimización para lector de pantalla
    if (screenReader) {
      root.classList.add("screen-reader");
    }
  }, [fontSize, screenReader, mounted]);

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
    localStorage.setItem("font-size", size);
  };

  const setScreenReader = (enabled: boolean) => {
    setScreenReaderState(enabled);
    localStorage.setItem("screen-reader", enabled.toString());
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
        setFontSize,
        setScreenReader,
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
