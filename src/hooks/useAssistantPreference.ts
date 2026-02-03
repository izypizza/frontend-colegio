import { useEffect, useState } from "react";

export const useAssistantPreference = () => {
  // Estado inicial false para evitar hydration mismatch
  const [assistantEnabled, setAssistantEnabled] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Solo acceder a localStorage en el cliente
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("assistant_enabled");
      // Por defecto true si no hay preferencia guardada
      const initialValue = saved !== null ? JSON.parse(saved) : true;
      setAssistantEnabled(initialValue);
      setIsLoaded(true);
    }

    // Escuchar cambios en otras pestañas/ventanas
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "assistant_enabled" && e.newValue !== null) {
        setAssistantEnabled(JSON.parse(e.newValue));
      }
    };

    // Escuchar cambios personalizados en la misma ventana
    const handleCustomEvent = (e: CustomEvent) => {
      setAssistantEnabled(e.detail);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("assistantToggle" as any, handleCustomEvent);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("assistantToggle" as any, handleCustomEvent);
    };
  }, []);

  const toggleAssistant = (enabled: boolean) => {
    setAssistantEnabled(enabled);

    // Solo acceder a localStorage en el cliente
    if (typeof window !== "undefined") {
      localStorage.setItem("assistant_enabled", JSON.stringify(enabled));

      // Disparar evento personalizado para actualizar en la misma ventana
      window.dispatchEvent(
        new CustomEvent("assistantToggle", { detail: enabled }),
      );
    }
  };

  return {
    assistantEnabled,
    toggleAssistant,
    isLoaded,
  };
};
