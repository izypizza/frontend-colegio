import { useCallback, useEffect, useState } from "react";
import { configuracionService } from "@/src/lib/services";

export interface ModulosActivos {
  biblioteca: boolean;
  elecciones: boolean;
  permisos: boolean;
  calificaciones: boolean;
  asistencias: boolean;
  horarios: boolean;
}

const modulosPorDefecto: ModulosActivos = {
  biblioteca: true,
  elecciones: true,
  permisos: true,
  calificaciones: true,
  asistencias: true,
  horarios: true,
};

export function useModulosActivos() {
  const [modulos, setModulos] = useState<ModulosActivos>(modulosPorDefecto);
  const [loading, setLoading] = useState(true);

  const fetchModulos = useCallback(async () => {
    try {
      const data = await configuracionService.modulosActivos();
      const normalizados = {
        ...modulosPorDefecto,
        ...(data as ModulosActivos),
      };
      guardarCache(normalizados);
      setModulos(normalizados);
    } catch (error) {
      console.error("Error al cargar módulos activos:", error);
    }
  }, []);

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      const enCache = leerCache();

      if (enCache) {
        setModulos(enCache);
        setLoading(false);
        return;
      }

      await fetchModulos();

      if (activo) setLoading(false);
    };

    cargar();

    return () => {
      activo = false;
    };
  }, [fetchModulos]);

  return {
    modulos,
    loading,
    refetch: async () => {
      limpiarCache();
      await fetchModulos();
    },
  };
}

const CLAVE_CACHE = "modulos_activos";
const VIGENCIA_CACHE_MS = 5 * 60 * 1000;

const leerCache = (): ModulosActivos | null => {
  if (typeof window === "undefined") return null;

  try {
    const crudo = window.sessionStorage.getItem(CLAVE_CACHE);
    if (!crudo) return null;

    const guardado = JSON.parse(crudo) as {
      datos: ModulosActivos;
      momento: number;
    };

    if (Date.now() - guardado.momento > VIGENCIA_CACHE_MS) return null;

    return guardado.datos;
  } catch {
    return null;
  }
};

const guardarCache = (datos: ModulosActivos) => {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(
      CLAVE_CACHE,
      JSON.stringify({ datos, momento: Date.now() }),
    );
  } catch {
    /* sin espacio en el almacenamiento */
  }
};

const limpiarCache = () => {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.removeItem(CLAVE_CACHE);
  } catch {
    /* sin acceso al almacenamiento */
  }
};
