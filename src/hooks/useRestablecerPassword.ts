"use client";

import { useState } from "react";
import { userManagementService } from "@/src/lib/services";

export interface CredencialTemporal {
  usuario: {
    id: number;
    name: string;
    email: string;
    role?: string;
  };
  password_temporal: string;
}

export function useRestablecerPassword() {
  const [credencial, setCredencial] = useState<CredencialTemporal | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const restablecer = async (userId: number) => {
    try {
      setCargando(true);
      setError(null);

      const respuesta = await userManagementService.restablecerPassword(userId);
      setCredencial({
        usuario: respuesta.usuario,
        password_temporal: respuesta.password_temporal,
      });

      return true;
    } catch (err: any) {
      setError(err?.message || "No se pudo restablecer la contraseña.");
      return false;
    } finally {
      setCargando(false);
    }
  };

  const cerrar = () => {
    setCredencial(null);
    setError(null);
  };

  return { credencial, cargando, error, restablecer, cerrar, setError };
}
