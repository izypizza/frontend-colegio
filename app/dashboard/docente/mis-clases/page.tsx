"use client";

import { useEffect, useMemo, useState } from "react";
import { Alert, Card, SelectBuscable } from "@/src/components/ui";
import { docentePortalService } from "@/src/lib/services";

interface Asignacion {
  id: number;
  materia_id: number;
  seccion_id: number;
  periodo_academico_id: number;
  materia: {
    id: number;
    nombre: string;
    codigo: string;
  };
  seccion: {
    id: number;
    nombre: string;
    grado: {
      nombre: string;
      nivel: string;
    };
  };
  periodo_academico: {
    id: number;
    nombre: string;
    estado?: string;
  };
}

interface CursoAgrupado {
  clave: string;
  materia: Asignacion["materia"];
  seccion: Asignacion["seccion"];
  periodos: { id: number; nombre: string; estado?: string }[];
}

export default function MisClasesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [periodoId, setPeriodoId] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const response = await docentePortalService.misAsignaciones();
        setAsignaciones(response.asignaciones || []);
        setError(null);
      } catch (err) {
        setError("No se pudieron cargar tus cursos asignados.");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  const opcionesPeriodo = useMemo(() => {
    const mapa = new Map<number, string>();

    asignaciones.forEach((asignacion) => {
      if (asignacion.periodo_academico) {
        mapa.set(
          asignacion.periodo_academico.id,
          asignacion.periodo_academico.nombre,
        );
      }
    });

    return Array.from(mapa.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([id, nombre]) => ({ valor: id, etiqueta: nombre }));
  }, [asignaciones]);

  const cursos = useMemo<CursoAgrupado[]>(() => {
    const mapa = new Map<string, CursoAgrupado>();

    asignaciones.forEach((asignacion) => {
      const clave = `${asignacion.materia_id}-${asignacion.seccion_id}`;
      const existente = mapa.get(clave);

      if (existente) {
        if (
          asignacion.periodo_academico &&
          !existente.periodos.some(
            (periodo) => periodo.id === asignacion.periodo_academico.id,
          )
        ) {
          existente.periodos.push(asignacion.periodo_academico);
        }
        return;
      }

      mapa.set(clave, {
        clave,
        materia: asignacion.materia,
        seccion: asignacion.seccion,
        periodos: asignacion.periodo_academico
          ? [asignacion.periodo_academico]
          : [],
      });
    });

    return Array.from(mapa.values())
      .map((curso) => ({
        ...curso,
        periodos: [...curso.periodos].sort((a, b) => a.id - b.id),
      }))
      .filter((curso) =>
        periodoId
          ? curso.periodos.some(
              (periodo) => String(periodo.id) === periodoId,
            )
          : true,
      )
      .sort((a, b) =>
        `${a.materia.nombre} ${a.seccion.grado.nombre}`.localeCompare(
          `${b.materia.nombre} ${b.seccion.grado.nombre}`,
        ),
      );
  }, [asignaciones, periodoId]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#04ADBF]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mis clases</h1>
          <p className="text-gray-600 mt-1">
            Un curso por sección. Los bimestres asignados aparecen dentro de
            cada curso, no como clases distintas.
          </p>
        </div>
        <div className="min-w-[220px]">
          <SelectBuscable
            label="Bimestre"
            opciones={opcionesPeriodo}
            valor={periodoId}
            onChange={setPeriodoId}
            vacio="Todos los bimestres"
            placeholder="Buscar bimestre"
          />
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {cursos.length === 0 ? (
        <Card>
          <div className="py-12 text-center text-gray-500">
            <p className="text-lg">No tienes cursos asignados</p>
            <p className="mt-2 text-sm">
              Contacta con la administración si esto es un error.
            </p>
          </div>
        </Card>
      ) : (
        <>
          <p className="text-sm text-gray-600">
            {cursos.length} curso(s) ·{" "}
            {cursos.reduce((total, curso) => total + curso.periodos.length, 0)}{" "}
            asignación(es) por bimestre
          </p>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {cursos.map((curso) => (
              <Card key={curso.clave} className="transition-shadow hover:shadow-lg">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-[#04ADBF]">
                  <svg
                    className="h-7 w-7 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>

                <h3 className="text-lg font-bold text-gray-900">
                  {curso.materia.nombre}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Código:{" "}
                  <span className="font-semibold">
                    {curso.materia.codigo}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  {curso.seccion.grado.nombre} - {curso.seccion.nombre}
                </p>

                <span className="mt-3 inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                  {curso.seccion.grado.nivel}
                </span>

                <div className="mt-4 border-t border-gray-100 pt-3">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                    Bimestres asignados
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {curso.periodos.length === 0 ? (
                      <span className="text-xs text-gray-400">
                        Sin bimestre registrado
                      </span>
                    ) : (
                      curso.periodos.map((periodo) => (
                        <span
                          key={periodo.id}
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                            periodo.estado === "activo"
                              ? "border-[#04ADBF] bg-[#04ADBF]/10 text-[#038a99]"
                              : "border-gray-200 bg-gray-50 text-gray-600"
                          }`}
                        >
                          {periodo.nombre}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
