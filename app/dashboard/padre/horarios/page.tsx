"use client";

import {
  Alert,
  Card,
  GrillaHorario,
  SelectBuscable,
} from "@/src/components/ui";
import { PermissionGuard } from "@/src/components/auth";
import { UserRole } from "@/src/types";
import { useErrorHandler } from "@/src/hooks/useErrorHandler";
import { padrePortalService } from "@/src/lib/services";
import { useEffect, useMemo, useState } from "react";

interface Hijo {
  id: number;
  nombre: string;
  apellido: string;
  seccion: {
    id: number;
    nombre: string;
    grado: { id: number; nombre: string; nivel: string };
  } | null;
}

export default function HorarioHijosPage() {
  const { error, handleError } = useErrorHandler();

  const [hijos, setHijos] = useState<Hijo[]>([]);
  const [hijoId, setHijoId] = useState("");
  const [hijo, setHijo] = useState<any>(null);
  const [bloques, setBloques] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoHorario, setCargandoHorario] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    const cargarHijos = async () => {
      try {
        setCargando(true);
        const respuesta = await padrePortalService.misHijos();
        const lista: Hijo[] = respuesta.hijos || [];
        setHijos(lista);

        if (lista.length > 0) {
          setHijoId(String(lista[0].id));
        }
      } catch (err) {
        handleError(err, "No se pudo cargar la lista de hijos");
      } finally {
        setCargando(false);
      }
    };

    cargarHijos();
  }, []);

  useEffect(() => {
    if (!hijoId) {
      setHijo(null);
      setBloques([]);
      return;
    }

    const cargarHorario = async () => {
      try {
        setCargandoHorario(true);
        setMensaje(null);

        const respuesta = await padrePortalService.horarioHijo(
          parseInt(hijoId),
        );

        setHijo(respuesta?.hijo ?? null);
        setBloques(respuesta?.bloques ?? []);
        setMensaje(respuesta?.message ?? null);
      } catch (err) {
        handleError(err, "No se pudo cargar el horario del estudiante");
        setHijo(null);
        setBloques([]);
      } finally {
        setCargandoHorario(false);
      }
    };

    cargarHorario();
  }, [hijoId]);

  const opcionesHijos = useMemo(
    () =>
      hijos.map((registro) => ({
        valor: registro.id,
        etiqueta: `${registro.apellido}, ${registro.nombre}`,
        detalle: registro.seccion
          ? `${registro.seccion.grado.nombre} ${registro.seccion.nombre}`
          : "Sin sección",
      })),
    [hijos],
  );

  return (
    <PermissionGuard
      requiredRoles={[UserRole.PADRE]}
      fallback={
        <div className="p-6">
          <Alert
            type="error"
            message="Esta página es para padres de familia."
          />
        </div>
      }
    >
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Horario de mis hijos
          </h1>
          <p className="text-gray-600 mt-1">
            Elige el estudiante y consulta su horario. Cada bloque dura 45
            minutos: son horas académicas, no horas cronológicas.
          </p>
        </div>

        {error && <Alert type="error" message={error} />}

        {cargando ? (
          <Card>
            <p className="py-10 text-center text-gray-600">Cargando...</p>
          </Card>
        ) : hijos.length === 0 ? (
          <Card>
            <Alert
              type="warning"
              message="No hay estudiantes vinculados a tu cuenta."
            />
          </Card>
        ) : (
          <>
            <Card>
              <div className="max-w-md">
                <SelectBuscable
                  label="Estudiante"
                  opciones={opcionesHijos}
                  valor={hijoId}
                  onChange={setHijoId}
                  placeholder="Buscar estudiante"
                />
              </div>

              {hijo?.seccion && (
                <p className="mt-3 border-t border-gray-100 pt-3 text-sm text-gray-600">
                  {hijo.nombre_completo || "Estudiante"} · {hijo.seccion}
                  {hijo.nivel ? ` · ${hijo.nivel}` : ""}
                </p>
              )}
            </Card>

            <Card>
              {cargandoHorario ? (
                <p className="py-10 text-center text-gray-600">
                  Cargando horario...
                </p>
              ) : mensaje && bloques.length === 0 ? (
                <Alert type="warning" message={mensaje} />
              ) : bloques.length === 0 ? (
                <Alert
                  type="warning"
                  message="Todavía no hay un horario registrado para esta sección."
                />
              ) : (
                <GrillaHorario
                  bloques={bloques}
                  renderBloque={(bloque) => (
                    <>
                      <span className="block text-xs font-bold leading-tight text-gray-900">
                        {bloque.materia || "Curso"}
                      </span>
                      {bloque.docente && (
                        <span className="mt-0.5 block text-[10px] text-gray-600">
                          {bloque.docente}
                        </span>
                      )}
                    </>
                  )}
                />
              )}
            </Card>
          </>
        )}
      </div>
    </PermissionGuard>
  );
}
