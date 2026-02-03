"use client";

import { Alert, Card } from "@/src/components/ui";
import { apiClient } from "@/src/lib/api-client";
import { useEffect, useState } from "react";

interface MiPermiso {
  puede_editar_estudiantes: boolean;
  puede_editar_asistencias: boolean;
  puede_editar_calificaciones: boolean;
  activado_hasta: string | null;
}

export default function MisPermisosPage() {
  const [permiso, setPermiso] = useState<MiPermiso | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMiPermiso();
  }, []);

  const fetchMiPermiso = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get("/mi-permiso-especial");
      setPermiso(data as MiPermiso);
    } catch (err) {
      setError("Error al cargar tus permisos");
    } finally {
      setLoading(false);
    }
  };

  const tieneAlgunPermiso =
    permiso &&
    (permiso.puede_editar_estudiantes ||
      permiso.puede_editar_asistencias ||
      permiso.puede_editar_calificaciones);

  const estaExpirado =
    permiso?.activado_hasta && new Date(permiso.activado_hasta) < new Date();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Mis Permisos Especiales
        </h1>
        <p className="text-gray-600 mt-2">
          Permisos temporales otorgados por el administrador
        </p>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      {!tieneAlgunPermiso ? (
        <Card>
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">
              <svg
                className="w-24 h-24 mx-auto text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Sin Permisos Especiales
            </h2>
            <p className="text-gray-600">
              Actualmente no tienes permisos especiales activos. Contacta al
              administrador si necesitas permisos temporales.
            </p>
          </div>
        </Card>
      ) : (
        <>
          {estaExpirado && (
            <Alert
              type="warning"
              message="Tus permisos especiales han expirado. Ya no puedes realizar las acciones autorizadas."
            />
          )}

          {!estaExpirado && permiso.activado_hasta && (
            <Alert
              type="info"
              message={`Tus permisos están activos hasta: ${new Date(permiso.activado_hasta).toLocaleString("es-PE")}`}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">
                    {permiso.puede_editar_estudiantes ? "Si" : "No"}
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      permiso.puede_editar_estudiantes && !estaExpirado
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {permiso.puede_editar_estudiantes && !estaExpirado
                      ? "ACTIVO"
                      : "INACTIVO"}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Editar Estudiantes
                </h3>
                <p className="text-sm text-gray-600">
                  {permiso.puede_editar_estudiantes && !estaExpirado
                    ? "Puedes crear, editar y eliminar información de estudiantes."
                    : "No tienes permiso para editar estudiantes."}
                </p>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">
                    {permiso.puede_editar_asistencias ? "Si" : "No"}
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      permiso.puede_editar_asistencias && !estaExpirado
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {permiso.puede_editar_asistencias && !estaExpirado
                      ? "ACTIVO"
                      : "INACTIVO"}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Editar Asistencias
                </h3>
                <p className="text-sm text-gray-600">
                  {permiso.puede_editar_asistencias && !estaExpirado
                    ? "Puedes registrar y modificar asistencias de estudiantes."
                    : "No tienes permiso para editar asistencias."}
                </p>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">
                    {permiso.puede_editar_calificaciones ? "Si" : "No"}
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      permiso.puede_editar_calificaciones && !estaExpirado
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {permiso.puede_editar_calificaciones && !estaExpirado
                      ? "ACTIVO"
                      : "INACTIVO"}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Editar Calificaciones
                </h3>
                <p className="text-sm text-gray-600">
                  {permiso.puede_editar_calificaciones && !estaExpirado
                    ? "Puedes registrar y modificar calificaciones de estudiantes."
                    : "No tienes permiso para editar calificaciones."}
                </p>
              </div>
            </Card>
          </div>

          {permiso.activado_hasta && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Informacion del Permiso
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Válido hasta:</p>
                    <p className="text-base font-semibold text-gray-900">
                      {new Date(permiso.activado_hasta).toLocaleDateString(
                        "es-PE",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Estado:</p>
                    <p
                      className={`text-base font-semibold ${
                        estaExpirado ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {estaExpirado ? "Expirado" : "Activo"}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {!permiso.activado_hasta && (
            <Card>
              <div className="p-6 bg-blue-50">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">[i]</div>
                  <div>
                    <h3 className="text-base font-semibold text-blue-900 mb-1">
                      Permiso sin fecha de expiración
                    </h3>
                    <p className="text-sm text-blue-800">
                      Este permiso es permanente hasta que el administrador
                      decida desactivarlo.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          <Card>
            <div className="p-6 bg-yellow-50 border-l-4 border-yellow-400">
              <h3 className="text-base font-semibold text-yellow-900 mb-2">
                Uso Responsable
              </h3>
              <p className="text-sm text-yellow-800">
                Estos permisos especiales son temporales y fueron otorgados por
                el administrador para situaciones específicas. Úsalos de manera
                responsable y solo para los fines autorizados. Todas las
                acciones quedan registradas.
              </p>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
