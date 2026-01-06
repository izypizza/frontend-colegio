"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { configuracionService } from "@/src/lib/services";

export default function MaintenancePage() {
  const router = useRouter();
  const [mensaje, setMensaje] = useState(
    "El sistema está en mantenimiento. Por favor, inténtelo más tarde."
  );

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        // Intentar obtener el mensaje de mantenimiento
        const config: any = await configuracionService.obtener(
          "sistema_mensaje_mantenimiento"
        );
        if (config?.valor) {
          setMensaje(config.valor);
        }
      } catch (error: any) {
        // Si la API responde con error de mantenimiento
        if (error?.response?.data?.message) {
          setMensaje(error.response.data.message);
        }
      }
    };

    checkMaintenance();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <div className="max-w-2xl w-full mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          {/* Icono de mantenimiento */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-5xl">🔧</span>
            </div>
          </div>

          {/* Título */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sistema en Mantenimiento
          </h1>

          {/* Mensaje personalizado */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
            <p className="text-lg text-gray-700 leading-relaxed">{mensaje}</p>
          </div>

          {/* Información adicional */}
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              🔄 Estamos realizando mejoras para brindarte un mejor servicio
            </p>
            <p>⏰ Por favor, intenta acceder más tarde</p>
            <p>
              📧 Si necesitas ayuda urgente, contacta al administrador del
              sistema
            </p>
          </div>

          {/* Botón de reintentar */}
          <div className="mt-8">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              🔄 Intentar nuevamente
            </button>
          </div>

          {/* Logo o nombre de la institución */}
          <div className="mt-12 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">I.E. N° 51006 "TÚPAC AMARU"</p>
            <p className="text-xs text-gray-400 mt-1">
              Sistema de Gestión Escolar
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
