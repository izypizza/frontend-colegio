"use client";

import { Alert, Button, Card, SelectBuscable } from "@/src/components/ui";
import { PermissionGuard } from "@/src/components/auth";
import { UserRole } from "@/src/types";
import { useErrorHandler } from "@/src/hooks/useErrorHandler";
import {
  libroNotasService,
  materiaService,
  periodoService,
  seccionService,
} from "@/src/lib/services";
import { useEffect, useMemo, useState } from "react";

const COLOR_NIVEL: Record<string, string> = {
  AD: "bg-green-100 text-green-800",
  A: "bg-blue-100 text-blue-800",
  B: "bg-amber-100 text-amber-800",
  C: "bg-red-100 text-red-800",
};

const DESCRIPCION_NIVEL: Record<string, string> = {
  AD: "Logro destacado",
  A: "Logro esperado",
  B: "En proceso",
  C: "En inicio",
};

const listaDe = (respuesta: any): any[] =>
  Array.isArray(respuesta) ? respuesta : respuesta?.data || [];

export default function LibroDeNotasPage() {
  const { error, setError, handleError } = useErrorHandler();

  const [periodos, setPeriodos] = useState<any[]>([]);
  const [secciones, setSecciones] = useState<any[]>([]);
  const [materias, setMaterias] = useState<any[]>([]);

  const [periodoId, setPeriodoId] = useState("");
  const [gradoNombre, setGradoNombre] = useState("");
  const [seccionId, setSeccionId] = useState("");
  const [materiaId, setMateriaId] = useState("");

  const [libro, setLibro] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [consultando, setConsultando] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);
        const [respuestaPeriodos, respuestaSecciones, respuestaMaterias] =
          await Promise.all([
            periodoService.getAll({ all: true }),
            seccionService.getAll({ all: true }),
            materiaService.getAll({ all: true }),
          ]);

        const listaPeriodos = listaDe(respuestaPeriodos);
        setPeriodos(listaPeriodos);
        setSecciones(listaDe(respuestaSecciones));
        setMaterias(listaDe(respuestaMaterias));

        const activo =
          listaPeriodos.find((periodo) => periodo.estado === "activo") ||
          listaPeriodos[0];

        if (activo) setPeriodoId(String(activo.id));
      } catch (err) {
        handleError(err, "No se pudieron cargar los filtros");
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, []);

  const grados = useMemo(() => {
    const nombres = new Set<string>();
    secciones.forEach((seccion) => {
      if (seccion.grado?.nombre) nombres.add(seccion.grado.nombre);
    });
    return Array.from(nombres).sort();
  }, [secciones]);

  const seccionesFiltradas = useMemo(
    () =>
      gradoNombre
        ? secciones.filter(
            (seccion) => seccion.grado?.nombre === gradoNombre,
          )
        : secciones,
    [secciones, gradoNombre],
  );

  const consultar = async () => {
    if (!seccionId || !materiaId || !periodoId) {
      setError("Elige periodo, sección y curso para ver el libro de notas.");
      return;
    }

    try {
      setConsultando(true);
      setError(null);
      const respuesta = await libroNotasService.obtener({
        seccion_id: parseInt(seccionId),
        materia_id: parseInt(materiaId),
        periodo_academico_id: parseInt(periodoId),
      });
      setLibro(respuesta);
    } catch (err) {
      handleError(err, "No se pudo cargar el libro de notas");
      setLibro(null);
    } finally {
      setConsultando(false);
    }
  };

  return (
    <PermissionGuard
      requiredRoles={[UserRole.ADMIN, UserRole.AUXILIAR, UserRole.DOCENTE]}
      fallback={
        <div className="p-6">
          <Alert type="error" message="No tiene permisos para esta página." />
        </div>
      }
    >
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Libro de notas</h1>
          <p className="text-gray-600 mt-1">
            Elige el periodo, el grado, la sección y el curso. Verás una fila
            por estudiante y una columna por competencia.
          </p>
        </div>

        {error && <Alert type="error" message={error} />}

        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Periodo
              </label>
              <select
                value={periodoId}
                onChange={(evento) => setPeriodoId(evento.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar periodo</option>
                {periodos.map((periodo) => (
                  <option key={periodo.id} value={periodo.id}>
                    {periodo.nombre} - {periodo.anio}
                  </option>
                ))}
              </select>
            </div>

            <SelectBuscable
              label="Grado"
              valor={gradoNombre}
              onChange={(valor) => {
                setGradoNombre(valor);
                setSeccionId("");
              }}
              vacio="Todos los grados"
              placeholder="Buscar grado"
              opciones={grados.map((grado) => ({
                valor: grado,
                etiqueta: grado,
              }))}
            />

            <SelectBuscable
              label="Sección"
              valor={seccionId}
              onChange={setSeccionId}
              vacio="Seleccionar sección"
              placeholder="Buscar por grado o sección"
              opciones={seccionesFiltradas.map((seccion) => ({
                valor: seccion.id,
                etiqueta: `${seccion.nombre} - ${seccion.grado?.nombre ?? ""}`.trim(),
              }))}
            />

            <SelectBuscable
              label="Curso"
              valor={materiaId}
              onChange={setMateriaId}
              vacio="Seleccionar curso"
              placeholder="Buscar curso"
              opciones={materias.map((materia) => ({
                valor: materia.id,
                etiqueta: materia.nombre,
              }))}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              {libro
                ? `${libro.estudiantes.length} estudiante(s) · ${libro.competencias.length} competencia(s) · ${libro.seccion.nombre}`
                : "Sin consulta realizada"}
            </p>
            <Button
              variant="primary"
              onClick={consultar}
              disabled={consultando || cargando}
            >
              {consultando ? "Cargando..." : "Ver libro de notas"}
            </Button>
          </div>
        </Card>

        {libro && libro.estudiantes.length > 0 && (
          <Card>
            <div className="mb-3">
              <h2 className="text-lg font-semibold text-gray-800">
                {libro.materia.nombre}
              </h2>
              <p className="text-sm text-gray-600">
                {libro.seccion.nombre} · {libro.periodo.nombre} · Ciclo{" "}
                {libro.seccion.ciclo}
              </p>
            </div>

            {libro.competencias.length === 0 ? (
              <Alert
                type="warning"
                message="Este curso no tiene competencias registradas para el ciclo de la sección."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th
                        scope="col"
                        className="px-3 py-2 font-semibold text-gray-700 sticky left-0 bg-gray-50"
                      >
                        Estudiante
                      </th>
                      {libro.competencias.map((competencia: any) => (
                        <th
                          key={competencia.id}
                          scope="col"
                          className="px-3 py-2 font-semibold text-gray-700 min-w-[150px] align-bottom"
                        >
                          <span className="block text-xs text-gray-500">
                            {competencia.codigo}
                          </span>
                          {competencia.nombre}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {libro.estudiantes.map((estudiante: any) => (
                      <tr key={estudiante.id} className="border-t border-gray-100">
                        <td className="px-3 py-2 sticky left-0 bg-white">
                          <div className="font-medium text-gray-900">
                            {`${estudiante.apellido_paterno} ${estudiante.apellido_materno}`}
                          </div>
                          <div className="text-xs text-gray-500">
                            {estudiante.nombres}
                            {estudiante.dni ? ` · DNI ${estudiante.dni}` : ""}
                          </div>
                        </td>
                        {estudiante.niveles.map((nivel: any) => (
                          <td key={nivel.competencia_id} className="px-3 py-2">
                            {nivel.nivel ? (
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${COLOR_NIVEL[nivel.nivel] || "bg-gray-100 text-gray-700"}`}
                                title={DESCRIPCION_NIVEL[nivel.nivel] || ""}
                              >
                                {nivel.nivel}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {libro && libro.estudiantes.length === 0 && (
          <Alert
            type="warning"
            message="La sección no tiene estudiantes matriculados."
          />
        )}
      </div>
    </PermissionGuard>
  );
}
