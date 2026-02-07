import { useState } from "react";

/**
 * Hook para manejo centralizado de errores y mensajes de éxito
 * Reemplaza el código duplicado en 15+ páginas
 */
export function useErrorHandler() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleError = (
    err: any,
    defaultMessage: string = "Ha ocurrido un error",
  ) => {
    console.error(err);
    const message =
      err?.response?.data?.message || err?.message || defaultMessage;
    setError(message);
    setSuccess(null);
  };

  const handleSuccess = (message: string, callback?: () => void) => {
    setSuccess(message);
    setError(null);
    if (callback) {
      callback();
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

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
