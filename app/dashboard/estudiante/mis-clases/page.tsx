"use client";

import { Alert, Card, Modal } from "@/src/components/ui";
import { PermissionGuard } from "@/src/components/auth";
import { UserRole } from "@/src/types";
import { useErrorHandler } from "@/src/hooks/useErrorHandler";
import { useModalState } from "@/src/hooks/useModalState";
import { estudiantePortalService } from "@/src/lib/services";
import { useEffect, useState } from "react";

const COLOR_NIVEL: Record<string, string> = {
  AD: "bg-green-100 text-green-800",
  A: "bg-blue-100 text-blue-800",
  B: "bg-amber-100 text-amber-800",
  C: "bg-red-100 text-red-800",
};

export default function MisClasesPage() {
  const { error, handleError } = useErrorHandler();
  const { isOpen, open, close } = useModalState();

  const [datos, setDatos] = useState<any>(null);
  const [claseActiva, setClaseActiva] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);
        const respuesta = await estudiantePortalService.misClases();
        setDatos(respuesta);
      } catch (err) {
        handleError(err, "No se pudieron cargar tus cursos");
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, []);

  const abrirDetalle = (clase: any) => {
    setClaseActiva(clase);
    open();
  };

  return (
    <PermissionGuard
      requiredRoles={[UserRole.ESTUDIANTE]}
      fallback={
        <div className="p-6">
          <Alert type="error" message="Esta página es para estudiantes." />
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mis clases</h1>
          <p className="text-gray-600 mt-1">
            {datos?.estudiante?.seccion || "Sin sección asignada"}
            {datos?.periodo ? ` · ${datos.periodo.nombre}` : ""}
          </p>
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => undefined} />
        )}

        {cargando && (
          <Card>
            <p className="text-center text-gray-600 py-6">Cargando...</p>
          </Card>
        )}

        {!cargando && datos?.clases?.length === 0 && (
          <Alert
            type="warning"
            message="Todavía no tienes cursos asignados en este periodo."
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(datos?.clases || []).map((clase: any) => (
            <button
              key={clase.materia_id}
              type="button"
              onClick={() => abrirDetalle(clase)}
              className="text-left rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-[#04ADBF] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#04ADBF]"
            >
              <h2 className="text-base font-semibold text-gray-900">
                {clase.materia}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {clase.docente || "Docente por asignar"}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {clase.horario.length > 0
                  ? clase.horario
                      .map(
                        (bloque: any) =>
                          `${bloque.dia} ${bloque.hora_inicio}`,
                      )
                      .join(" · ")
                  : "Sin horario registrado"}
              </p>
              <span className="inline-block mt-3 text-xs font-semibold text-[#04ADBF]">
                Ver detalle →
              </span>
            </button>
          ))}
        </div>

        <Modal
          isOpen={isOpen}
          onClose={close}
          title={claseActiva?.materia || "Detalle del curso"}
          size="lg"
        >
          {claseActiva && (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Docente
                </p>
                <p className="text-sm text-gray-900">
                  {claseActiva.docente || "Docente por asignar"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-gray-500 mb-2">
                  Horario
                </p>
                {claseActiva.horario.length === 0 ? (
                  <p className="text-sm text-gray-600">
                    Sin horario registrado.
                  </p>
                ) : (
                  <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg">
                    {claseActiva.horario.map((bloque: any, indice: number) => (
                      <li
                        key={indice}
                        className="px-3 py-2 flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-800">{bloque.dia}</span>
                        <span className="font-mono text-gray-700">
                          {bloque.hora_inicio} - {bloque.hora_fin}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-gray-500 mb-2">
                  Competencias y mi nivel
                </p>
                {claseActiva.competencias.length === 0 ? (
                  <p className="text-sm text-gray-600">
                    Esta área no tiene competencias registradas.
                  </p>
                ) : (
                  <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg">
                    {claseActiva.competencias.map((competencia: any) => (
                      <li
                        key={competencia.id}
                        className="px-3 py-2 flex flex-wrap items-start justify-between gap-2"
                      >
                        <div className="flex-1 min-w-[180px]">
                          <p className="text-sm text-gray-900">
                            {competencia.nombre}
                          </p>
                          <p className="text-xs text-gray-500">
                            {competencia.codigo}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            competencia.nivel
                              ? COLOR_NIVEL[competencia.nivel] ||
                                "bg-gray-100 text-gray-600"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {competencia.nivel || "Sin registrar"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </PermissionGuard>
  );
}
