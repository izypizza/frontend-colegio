import { useCallback, useState } from "react";

const obtenerMensajeDeValidacion = (errores: unknown): string | null => {
  if (!errores || typeof errores !== "object") {
    return null;
  }

  for (const lista of Object.values(errores as Record<string, unknown>)) {
    if (Array.isArray(lista)) {
      const primero = lista.find(
        (mensaje) => typeof mensaje === "string" && mensaje.trim() !== "",
      );
      if (typeof primero === "string") {
        return primero;
      }
    }

    if (typeof lista === "string" && lista.trim() !== "") {
      return lista;
    }
  }

  return null;
};

/**
 * Hook para manejo centralizado de errores y mensajes de éxito
 * Reemplaza el código duplicado en 15+ páginas
 */
export function useErrorHandler() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleError = useCallback(
    (err: any, defaultMessage: string = "Ha ocurrido un error") => {
      console.error(err);
      const message =
        obtenerMensajeDeValidacion(err?.response?.data?.errors) ||
        err?.response?.data?.message ||
        err?.message ||
        defaultMessage;
      setError(message);
      setSuccess(null);
    },
    [],
  );

  const handleSuccess = useCallback(
    (message: string, callback?: () => void) => {
      setSuccess(message);
      setError(null);
      if (callback) {
        callback();
      }
    },
    [],
  );

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  return {
    error,
    success,
    handleError,
    handleSuccess,
    clearMessages,
    setError,
    setSuccess,
  };
}
