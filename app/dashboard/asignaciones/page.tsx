"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, Table } from "@/src/components/ui";
import { PermissionGuard } from "@/src/components/auth";
import { UserRole } from "@/src/types";
import { usePermissions } from "@/src/hooks/usePermissions";
import { useErrorHandler } from "@/src/hooks/useErrorHandler";
import {
  asignacionAnualService,
  docenteService,
  materiaService,
  seccionService,
} from "@/src/lib/services";
import type { Docente, Materia, Seccion } from "@/src/types/models";
import type { CursoAsignadoAnual } from "@/src/lib/services";

export default function AsignacionesPage() {
  const permissions = usePermissions("docentes");
  const { error, success, handleError, handleSuccess } = useErrorHandler();

  const [anio, setAnio] = useState(() => new Date().getFullYear());
  const [cursos, setCursos] = useState<CursoAsignadoAnual[]>([]);
  const [bimestresDelAnio, setBimestresDelAnio] = useState(0);
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [secciones, setSecciones] = useState<Seccion[]>([]);

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [docenteId, setDocenteId] = useState("");
  const [materiaId, setMateriaId] = useState("");
  const [seccionId, setSeccionId] = useState("");
  const [esTutor, setEsTutor] = useState(false);

  const cargarCatalogos = useCallback(async () => {
    try {
      const [listaDocentes, listaMaterias, listaSecciones] = await Promise.all([
        docenteService.getAll({ all: true }),
        materiaService.getAll({ all: true }),
        seccionService.getAll({ all: true }),
      ]);

      setDocentes(
        Array.isArray(listaDocentes) ? listaDocentes : listaDocentes.data,
      );
      setMaterias(
        Array.isArray(listaMaterias) ? listaMaterias : listaMaterias.data,
      );
      setSecciones(
        Array.isArray(listaSecciones) ? listaSecciones : listaSecciones.data,
      );
    } catch (err) {
      handleError(err, "No se pudieron cargar docentes, materias y secciones");
    }
  }, [handleError]);

  const cargarCursos = useCallback(
    async (anioConsulta: number) => {
      try {
        setLoading(true);
        const respuesta = await asignacionAnualService.listar(anioConsulta);
        setCursos(respuesta.cursos);
        setBimestresDelAnio(respuesta.bimestres_del_anio);
      } catch (err) {
        handleError(err, "No se pudieron cargar las asignaciones");
      } finally {
        setLoading(false);
      }
    },
    [handleError],
  );

  useEffect(() => {
    cargarCatalogos();
  }, [cargarCatalogos]);

  useEffect(() => {
    cargarCursos(anio);
  }, [anio, cargarCursos]);

  const asignar = async (evento: React.FormEvent) => {
    evento.preventDefault();

    if (!docenteId || !materiaId || !seccionId) {
      handleError(null, "Selecciona el docente, la materia y la sección.");
      return;
    }

    setGuardando(true);

    try {
      const respuesta = await asignacionAnualService.asignar({
        docente_id: Number(docenteId),
        materia_id: Number(materiaId),
        seccion_id: Number(seccionId),
        anio,
        es_tutor: esTutor,
      });

      handleSuccess(respuesta.message);
      setMateriaId("");
      setSeccionId("");
      setEsTutor(false);
      await cargarCursos(anio);
    } catch (err) {
      handleError(err, "No se pudo asignar el curso");
    } finally {
      setGuardando(false);
    }
  };

  const quitar = async (curso: CursoAsignadoAnual) => {
    if (
      !confirm(
        `¿Quitar ${curso.materia} de ${curso.grado} "${curso.seccion}" a ${curso.docente} en todo el año ${curso.anio}?`,
      )
    ) {
      return;
    }

    try {
      const respuesta = await asignacionAnualService.quitar({
        docente_id: curso.docente_id,
        materia_id: curso.materia_id,
        seccion_id: curso.seccion_id,
        anio: curso.anio,
      });

      handleSuccess(respuesta.message);
      await cargarCursos(anio);
    } catch (err) {
      handleError(err, "No se pudo quitar el curso");
    }
  };

  const docentesConCarga = useMemo(
    () => new Set(cursos.map((curso) => curso.docente_id)).size,
    [cursos],
  );

  const cursosCompletos = useMemo(
    () =>
      cursos.filter(
        (curso) => bimestresDelAnio > 0 && curso.bimestres >= bimestresDelAnio,
      ).length,
    [cursos, bimestresDelAnio],
  );

  const columns = [
    {
      key: "docente",
      label: "Docente",
      render: (_valor: unknown, curso: CursoAsignadoAnual) => (
        <span className="text-sm font-medium text-gray-900">
          {curso.docente}
        </span>
      ),
    },
    {
      key: "materia",
      label: "Materia",
      render: (_valor: unknown, curso: CursoAsignadoAnual) => (
        <span className="text-sm text-gray-700">{curso.materia}</span>
      ),
    },
    {
      key: "seccion",
      label: "Grado y Sección",
      render: (_valor: unknown, curso: CursoAsignadoAnual) => (
        <span className="text-sm text-gray-700">
          {curso.grado} &quot;{curso.seccion}&quot;
        </span>
      ),
    },
    {
      key: "bimestres",
      label: "Bimestres",
      render: (_valor: unknown, curso: CursoAsignadoAnual) => {
        const completo =
          bimestresDelAnio > 0 && curso.bimestres >= bimestresDelAnio;

        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              completo
                ? "bg-green-100 text-green-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {curso.bimestres}/{bimestresDelAnio || "?"}
          </span>
        );
      },
    },
    {
      key: "es_tutor",
      label: "Tutor",
      render: (_valor: unknown, curso: CursoAsignadoAnual) => (
        <span className="text-sm text-gray-700">
          {curso.es_tutor ? "Sí" : "—"}
        </span>
      ),
    },
  ];

  const aniosDisponibles = useMemo(() => {
    const actual = new Date().getFullYear();
    return [actual - 2, actual - 1, actual, actual + 1];
  }, []);

  return (
    <PermissionGuard requiredRoles={[UserRole.ADMIN]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Asignación de cursos
            </h1>
            <p className="text-sm text-gray-500">
              Asigna un curso a un docente para todo el año en un solo paso
            </p>
          </div>
          <select
            value={anio}
            onChange={(evento) => setAnio(Number(evento.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#04ADBF]"
          >
            {aniosDisponibles.map((opcion) => (
              <option key={opcion} value={opcion}>
                Año {opcion}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Cursos asignados
            </p>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
              {cursos.length}
            </p>
          </Card>
          <Card>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Docentes con carga
            </p>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
              {docentesConCarga}
            </p>
          </Card>
          <Card>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Año completo
            </p>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-[#04ADBF]">
              {cursosCompletos}
            </p>
          </Card>
          <Card>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Bimestres del año
            </p>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
              {bimestresDelAnio}
            </p>
            <p className="mt-1 text-xs text-gray-500">Configurados</p>
          </Card>
        </div>

        {bimestresDelAnio === 0 && (
          <Card>
            <p className="text-sm text-amber-800">
              El año {anio} no tiene bimestres registrados. Ve a Periodos y usa
              &quot;Generar año&quot; antes de asignar cursos.
            </p>
          </Card>
        )}

        {permissions.canEdit && bimestresDelAnio > 0 && (
          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
              Nueva asignación
            </h2>
            <form
              onSubmit={asignar}
              className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Docente
                </label>
                <select
                  value={docenteId}
                  onChange={(evento) => setDocenteId(evento.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#04ADBF]"
                  required
                >
                  <option value="">Seleccionar</option>
                  {docentes.map((docente) => (
                    <option key={docente.id} value={docente.id}>
                      {docente.apellido_paterno} {docente.apellido_materno},{" "}
                      {docente.nombres}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Materia
                </label>
                <select
                  value={materiaId}
                  onChange={(evento) => setMateriaId(evento.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#04ADBF]"
                  required
                >
                  <option value="">Seleccionar</option>
                  {materias.map((materia) => (
                    <option key={materia.id} value={materia.id}>
                      {materia.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sección
                </label>
                <select
                  value={seccionId}
                  onChange={(evento) => setSeccionId(evento.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#04ADBF]"
                  required
                >
                  <option value="">Seleccionar</option>
                  {secciones.map((seccion) => (
                    <option key={seccion.id} value={seccion.id}>
                      {seccion.nombre} - {seccion.grado?.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={esTutor}
                    onChange={(evento) => setEsTutor(evento.target.checked)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  Tutor
                </label>
                <Button type="submit" variant="primary" disabled={guardando}>
                  {guardando ? "Asignando..." : "Asignar año"}
                </Button>
              </div>
            </form>
          </Card>
        )}

        <Card>
          <Table
            columns={columns}
            data={cursos}
            loading={loading}
            extraActions={
              permissions.canDelete
                ? (curso: CursoAsignadoAnual) => (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => quitar(curso)}
                    >
                      Quitar
                    </Button>
                  )
                : undefined
            }
          />
        </Card>
      </div>
    </PermissionGuard>
  );
}
