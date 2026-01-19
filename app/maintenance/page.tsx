"use client";

import { useRouter } from "next/navigation";

export default function MaintenancePage() {
  const router = useRouter();
  const mensaje =
    "El sistema está en mantenimiento. Por favor, inténtelo más tarde.";

  const handleLogout = () => {
    // Limpiar localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Usar window.location para forzar recarga completa
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F2F0CE] to-[#FEFCD6]">
      <div className="max-w-2xl w-full mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          {/* Icono de mantenimiento */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-[#04ADBF] to-[#038a9a] rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
          </div>

          {/* Título */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sistema en Mantenimiento
          </h1>

          {/* Mensaje personalizado */}
          <div className="bg-[#FEFCD6] border border-[#F2F0CE] rounded-lg p-6 mb-6">
            <p className="text-lg text-gray-700 leading-relaxed">{mensaje}</p>
          </div>

          {/* Información adicional */}
          <div className="space-y-3 text-sm text-gray-600">
            <p>Estamos realizando mejoras para brindarte un mejor servicio</p>
            <p>Por favor, intenta acceder más tarde</p>
            <p>
              Si necesitas ayuda urgente, contacta al administrador del sistema
            </p>
          </div>

          {/* Botones */}
          <div className="mt-8 flex gap-4 justify-center">
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Regresar al Login
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-[#04ADBF] to-[#038a9a] text-white font-semibold rounded-lg hover:from-[#038a9a] hover:to-[#027080] transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Intentar nuevamente
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
