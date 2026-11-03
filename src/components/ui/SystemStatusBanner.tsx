"use client";

import type { SystemStatus } from "@/src/hooks/useSystemWakeUp";

interface SystemStatusBannerProps {
  estado: SystemStatus;
  intentoActual: number;
  totalIntentos: number;
  onRetry: () => void;
}

export function SystemStatusBanner({
  estado,
  intentoActual,
  totalIntentos,
  onRetry,
}: SystemStatusBannerProps) {
  if (estado === "listo") {
    return null;
  }

  const conectando = estado === "despertando";

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex justify-center px-4 pt-3">
      <div
        className={`pointer-events-auto flex items-center gap-3 rounded-full px-4 py-2 text-sm shadow-lg ${
          conectando ? "bg-blue-600 text-white" : "bg-red-600 text-white"
        }`}
        role="status"
        aria-live="polite"
      >
        {conectando ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        ) : (
          <span className="text-base leading-none">!</span>
        )}

        <span>
          {conectando
            ? intentoActual > 1
              ? `Conectando con el servidor… (intento ${intentoActual} de ${totalIntentos})`
              : "Conectando con el servidor… puede tardar hasta un minuto la primera vez"
            : "No se pudo conectar con el servidor"}
        </span>

        {!conectando && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-full bg-white/20 px-3 py-1 font-medium transition-colors hover:bg-white/30"
          >
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
}
