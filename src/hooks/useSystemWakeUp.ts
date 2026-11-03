"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "@/src/config/constants";

export type SystemStatus = "despertando" | "listo" | "sin-conexion";

const TIMEOUT_POR_DEFECTO = 45000;
const INTERVALO_POR_DEFECTO = 3000;
const INTENTOS_POR_DEFECTO = 12;
const LATIDO_POR_DEFECTO = 10 * 60 * 1000;

async function consultarDisponibilidad(timeoutMs: number): Promise<boolean> {
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), timeoutMs);

  try {
    const respuesta = await fetch(`${API_BASE_URL}/ping`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: controlador.signal,
    });

    return respuesta.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(temporizador);
  }
}

interface OpcionesDespertar {
  intentos?: number;
  intervaloMs?: number;
  timeoutMs?: number;
}

/**
 * Despierta el backend cuando el servicio arranca en frío.
 * Reintenta hasta que responde o se agotan los intentos.
 */
export function useSystemWakeUp({
  intentos = INTENTOS_POR_DEFECTO,
  intervaloMs = INTERVALO_POR_DEFECTO,
  timeoutMs = TIMEOUT_POR_DEFECTO,
}: OpcionesDespertar = {}) {
  const [estado, setEstado] = useState<SystemStatus>("despertando");
  const [intentoActual, setIntentoActual] = useState(0);
  const generacion = useRef(0);

  const verificar = useCallback(async () => {
    const actual = generacion.current + 1;
    generacion.current = actual;

    setEstado("despertando");
    setIntentoActual(0);

    for (let intento = 1; intento <= intentos; intento += 1) {
      if (generacion.current !== actual) return;

      setIntentoActual(intento);

      const disponible = await consultarDisponibilidad(timeoutMs);

      if (generacion.current !== actual) return;

      if (disponible) {
        setEstado("listo");
        return;
      }

      if (intento < intentos) {
        await new Promise((resolver) => setTimeout(resolver, intervaloMs));
      }
    }

    if (generacion.current === actual) {
      setEstado("sin-conexion");
    }
  }, [intentos, intervaloMs, timeoutMs]);

  useEffect(() => {
    void verificar();

    return () => {
      generacion.current += 1;
    };
  }, [verificar]);

  return {
    estado,
    intentoActual,
    totalIntentos: intentos,
    reintentar: verificar,
  };
}

/**
 * Mantiene el servicio despierto mientras la pestaña está visible.
 * No hace nada si el usuario cambió de pestaña o cerró el dashboard.
 */
export function useSystemKeepAlive(intervaloMs = LATIDO_POR_DEFECTO) {
  useEffect(() => {
    const enviarLatido = () => {
      if (document.visibilityState === "visible") {
        void consultarDisponibilidad(TIMEOUT_POR_DEFECTO);
      }
    };

    const temporizador = window.setInterval(enviarLatido, intervaloMs);

    return () => window.clearInterval(temporizador);
  }, [intervaloMs]);
}
