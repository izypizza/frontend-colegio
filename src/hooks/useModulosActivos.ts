import { useState, useEffect } from "react";
import { configuracionService } from "@/src/lib/services";

export interface ModulosActivos {
  biblioteca: boolean;
  elecciones: boolean;
  permisos: boolean;
  calificaciones: boolean;
  asistencias: boolean;
  horarios: boolean;
}

export function useModulosActivos() {
  const [modulos, setModulos] = useState<ModulosActivos>({
    biblioteca: true,
    elecciones: true,
    permisos: true,
    calificaciones: true,
    asistencias: true,
    horarios: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModulos();
  }, []);

  const fetchModulos = async () => {
    try {
      const data = await configuracionService.modulosActivos();
      setModulos(data as ModulosActivos);
    } catch (error) {
      console.error("Error al cargar módulos activos:", error);
    } finally {
      setLoading(false);
    }
  };

  return { modulos, loading, refetch: fetchModulos };
}
