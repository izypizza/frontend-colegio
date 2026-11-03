"use client";

import { useEffect, useRef } from "react";

interface OpcionesAutoRefresh {
  intervaloMs?: number;
  activo?: boolean;
}

export function useAutoRefresh(
  callback: () => void | Promise<void>,
  { intervaloMs = 30000, activo = true }: OpcionesAutoRefresh = {},
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!activo) return;

    let cancelado = false;
    let enCurso = false;

    const ejecutar = async () => {
      if (cancelado || enCurso) return;
      if (document.visibilityState !== "visible") return;

      enCurso = true;

      try {
        await callbackRef.current();
      } catch {
        // Un fallo del refresco automatico no debe interrumpir al usuario
      } finally {
        enCurso = false;
      }
    };

    const temporizador = window.setInterval(ejecutar, intervaloMs);

    return () => {
      cancelado = true;
      window.clearInterval(temporizador);
    };
  }, [intervaloMs, activo]);
}
