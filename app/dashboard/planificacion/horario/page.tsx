"use client";

import {
  Alert,
  Button,
  Card,
  Input,
  Modal,
  Pagination,
  SelectBuscable,
  Table,
} from "@/src/components/ui";
import {
  horarioService,
  materiaService,
  seccionService,
} from "@/src/lib/services";
import {
  DIAS_SEMANA,
  construirFilasHorario,
  normalizarHora,
  rangoHorario,
} from "@/src/lib/horario";
import { Horario, Materia, Seccion } from "@/src/types/models";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/src/features/auth";
import { useErrorHandler } from "@/src/hooks/useErrorHandler";
import { useModalState } from "@/src/hooks/useModalState";
import { usePermissions } from "@/src/hooks/usePermissions";
import { PermissionGuard } from "@/src/components/auth";
import { UserRole } from "@/src/types";

const BLOQUES_RAPIDOS = [
  { etiqueta: "Hora 1 · 08:00 - 08:45", inicio: "08:00", fin: "08:45" },
  { etiqueta: "Hora 2 · 08:45 - 09:30", inicio: "08:45", fin: "09:30" },
  { etiqueta: "Hora 3 · 09:30 - 10:15", inicio: "09:30", fin: "10:15" },
  { etiqueta: "Hora 4 · 10:30 - 11:15", inicio: "10:30", fin: "11:15" },
  { etiqueta: "Hora 5 · 11:15 - 12:00", inicio: "11:15", fin: "12:00" },
  { etiqueta: "Hora 6 · 12:00 - 12:45", inicio: "12:00", fin: "12:45" },
];

const COLORES_MATERIA = [
  "bg-blue-50 border-blue-300 text-blue-900",
  "bg-emerald-50 border-emerald-300 text-emerald-900",
  "bg-amber-50 border-amber-300 text-amber-900",
  "bg-purple-50 border-purple-300 text-purple-900",
  "bg-pink-50 border-pink-300 text-pink-900",
  "bg-indigo-50 border-indigo-300 text-indigo-900",
  "bg-rose-50 border-rose-300 text-rose-900",
  "bg-cyan-50 border-cyan-300 text-cyan-900",
];

export default function HorariosPage() {
  const { user } = useAuth();
  const permissions = usePermissions("horarios");
  const esGestor = user?.role === "admin" || user?.role === "auxiliar";

  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [vista, setVista] = useState<"calendario" | "lista">("calendario");
  const [seccionSeleccionada, setSeccionSeleccionada] = useState("");
  const [paginaLista, setPaginaLista] = useState(1);
  const [porPagina] = useState(25);
  const [formulario, setFormulario] = useState({
    seccion_id: "",
    materia_id: "",
    dia: "",
    hora_inicio: "",
    hora_fin: "",
  });

  const { error, success, handleError, handleSuccess, setError, setSuccess } =
    useErrorHandler();
  const { isOpen, editingItem, openCreate, openEdit, close } =
    useModalState<Horario>();

  const cargarHorarios = useCallback(async () => {
    try {
      setCargando(true);

      const respuestaHorarios = (await horarioService.getAll({
        all: true,
      })) as any;

      const lista: Horario[] = Array.isArray(respuestaHorarios)
        ? respuestaHorarios
        : respuestaHorarios?.data || [];

      setHorarios(lista);

      if (esGestor) {
        const [respuestaSecciones, respuestaMaterias] = await Promise.all([
          seccionService.getAll({ all: true }),
          materiaService.getAll({ all: true }),
        ]);

        setSecciones(
          (Array.isArray(respuestaSecciones)
            ? respuestaSecciones
            : []) as Seccion[],
        );
        setMaterias(
          (Array.isArray(respuestaMaterias) ? respuestaMaterias : []) as Materia[],
        );
        return;
      }

      const seccionesUnicas = new Map<number, Seccion>();
      lista.forEach((horario) => {
        if (horario.seccion) {
          seccionesUnicas.set(horario.seccion_id, horario.seccion);
        }
      });
      setSecciones(Array.from(seccionesUnicas.values()));
    } catch (err) {
      handleError(err, "Error al cargar los horarios");
    } finally {
      setCargando(false);
    }
  }, [esGestor, handleError]);

  useEffect(() => {
    if (!user) return;
    cargarHorarios();
  }, [user, cargarHorarios]);

  const opcionesSecciones = useMemo(
    () =>
      secciones.map((seccion) => ({
        valor: seccion.id,
        etiqueta: `${seccion.grado?.nombre ?? ""} ${seccion.nombre}`.trim(),
        detalle: seccion.grado?.nivel ?? null,
      })),
    [secciones],
  );

  const opcionesMaterias = useMemo(
    () =>
      materias.map((materia) => ({
        valor: materia.id,
        etiqueta: materia.nombre,
      })),
    [materias],
  );

  const horariosFiltrados = useMemo(() => {
    const lista = seccionSeleccionada
      ? horarios.filter(
          (horario) => String(horario.seccion_id) === seccionSeleccionada,
        )
      : horarios;

    return [...lista].sort((a, b) => {
      const ordenDia =
        DIAS_SEMANA.indexOf(a.dia as (typeof DIAS_SEMANA)[number]) -
        DIAS_SEMANA.indexOf(b.dia as (typeof DIAS_SEMANA)[number]);

      if (ordenDia !== 0) return ordenDia;

      return normalizarHora(a.hora_inicio).localeCompare(
        normalizarHora(b.hora_inicio),
      );
    });
  }, [horarios, seccionSeleccionada]);

  const filas = useMemo(
    () => construirFilasHorario(horariosFiltrados),
    [horariosFiltrados],
  );

  const totalPaginasLista = Math.max(
    1,
    Math.ceil(horariosFiltrados.length / porPagina),
  );

  const paginaActualLista = Math.min(paginaLista, totalPaginasLista);

  const horariosDeLaPagina = horariosFiltrados.slice(
    (paginaActualLista - 1) * porPagina,
    paginaActualLista * porPagina,
  );

  const horarioEnCelda = (dia: string, inicio: string) =>
    horariosFiltrados.find(
      (horario) =>
        horario.dia?.toLowerCase() === dia.toLowerCase() &&
        normalizarHora(horario.hora_inicio) === inicio,
    );

  const colorMateria = (materiaId: number) =>
    COLORES_MATERIA[materiaId % COLORES_MATERIA.length];

  const abrirCrear = () => {
    setFormulario({
      seccion_id: seccionSeleccionada || "",
      materia_id: "",
      dia: "",
      hora_inicio: "",
      hora_fin: "",
    });
    setError(null);
    openCreate();
  };

  const abrirEditar = (horario: Horario) => {
    setFormulario({
      seccion_id: String(horario.seccion_id),
      materia_id: String(horario.materia_id),
      dia: horario.dia,
      hora_inicio: normalizarHora(horario.hora_inicio),
      hora_fin: normalizarHora(horario.hora_fin),
    });
    setError(null);
    openEdit(horario);
  };

  const eliminarHorario = async (horario: Horario) => {
    if (!confirm("¿Eliminar este bloque de horario?")) return;

    try {
      await horarioService.delete(horario.id);
      handleSuccess("Bloque de horario eliminado.");
      cargarHorarios();
    } catch (err) {
      handleError(err, "No se pudo eliminar el bloque");
    }
  };

  const guardarHorario = async (evento?: React.FormEvent) => {
    evento?.preventDefault();

    if (
      !formulario.seccion_id ||
      !formulario.materia_id ||
      !formulario.dia ||
      !formulario.hora_inicio ||
      !formulario.hora_fin
    ) {
      setError("Completa sección, curso, día y las horas del bloque.");
      return;
    }

    const datos = {
      seccion_id: parseInt(formulario.seccion_id),
      materia_id: parseInt(formulario.materia_id),
      dia: formulario.dia,
      hora_inicio: formulario.hora_inicio,
      hora_fin: formulario.hora_fin,
    };

    try {
      if (editingItem) {
        await horarioService.update(editingItem.id, datos);
        handleSuccess("Bloque actualizado.");
      } else {
        await horarioService.create(datos);
        handleSuccess("Bloque registrado.");
      }

      close();
      cargarHorarios();
    } catch (err) {
      handleError(err, "No se pudo guardar el bloque");
    }
  };

  const aplicarBloqueRapido = (inicio: string, fin: string) => {
    setFormulario((previo) => ({
      ...previo,
      hora_inicio: inicio,
      hora_fin: fin,
    }));
  };

  const columnas = [
    {
      key: "seccion",
      label: "Sección",
      render: (_valor: unknown, horario: Horario) =>
        `${horario.seccion?.grado?.nombre ?? ""} ${horario.seccion?.nombre ?? ""}`.trim() ||
        "—",
    },
    {
      key: "materia",
      label: "Curso",
      render: (_valor: unknown, horario: Horario) =>
        horario.materia?.nombre || "—",
    },
    { key: "dia", label: "Día" },
    {
      key: "hora_inicio",
      label: "Horario",
      render: (_valor: unknown, horario: Horario) =>
        rangoHorario(horario.hora_inicio, horario.hora_fin),
    },
  ];

  return (
    <PermissionGuard
      requiredRoles={[
        UserRole.ADMIN,
        UserRole.AUXILIAR,
        UserRole.DOCENTE,
        UserRole.ESTUDIANTE,
      ]}
      fallback={
        <div className="p-6">
          <Alert
            type="error"
            message="No tiene permisos para acceder a esta página."
          />
        </div>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Horario</h1>
            <p className="text-gray-600 mt-1">
              Cada bloque dura 45 minutos: son las horas académicas del colegio,
              no horas cronológicas.
            </p>
          </div>
          {permissions.canCreate && (
            <Button variant="primary" onClick={abrirCrear}>
              + Nuevo bloque
            </Button>
          )}
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError(null)} />
        )}
        {success && (
          <Alert
            type="success"
            message={success}
            onClose={() => setSuccess(null)}
          />
        )}

        <Card>
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[220px] flex-1">
              <SelectBuscable
                label="Sección"
                opciones={opcionesSecciones}
                valor={seccionSeleccionada}
                onChange={(valor) => {
                  setSeccionSeleccionada(valor);
                  setPaginaLista(1);
                }}
                vacio="Todas las secciones"
                placeholder="Buscar sección..."
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setVista("calendario")}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  vista === "calendario"
                    ? "bg-[#04ADBF] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Calendario
              </button>
              <button
                type="button"
                onClick={() => setVista("lista")}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  vista === "lista"
                    ? "bg-[#04ADBF] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Lista
              </button>
            </div>
          </div>
        </Card>

        {cargando ? (
          <Card>
            <p className="py-10 text-center text-gray-600">Cargando horario...</p>
          </Card>
        ) : horariosFiltrados.length === 0 ? (
          <Card>
            <Alert
              type="warning"
              message={
                seccionSeleccionada
                  ? "Esta sección todavía no tiene bloques de horario."
                  : "Todavía no hay bloques de horario registrados."
              }
            />
          </Card>
        ) : vista === "calendario" ? (
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 w-24 border border-gray-200 bg-gray-100 px-2 py-2 text-left text-xs font-bold uppercase text-gray-600">
                      Hora
                    </th>
                    {DIAS_SEMANA.map((dia) => (
                      <th
                        key={dia}
                        className="min-w-[140px] border border-gray-200 bg-[#04ADBF] px-2 py-2 text-center text-xs font-bold uppercase text-white"
                      >
                        {dia}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filas.map((franja) =>
                    franja.tipo === "receso" ? (
                      <tr key={franja.inicio} className="bg-gray-50">
                        <td className="sticky left-0 z-10 border border-gray-200 bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-500">
                          {rangoHorario(franja.inicio, franja.fin)}
                        </td>
                        <td
                          colSpan={DIAS_SEMANA.length}
                          className="border border-gray-200 px-2 py-1 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-500"
                        >
                          Recreo
                        </td>
                      </tr>
                    ) : (
                      <tr key={franja.inicio}>
                        <td className="sticky left-0 z-10 border border-gray-200 bg-gray-50 px-2 py-2 align-top">
                          <span className="block text-[11px] font-bold uppercase text-gray-700">
                            {franja.etiqueta}
                          </span>
                          <span className="block text-[11px] text-gray-500">
                            {rangoHorario(franja.inicio, franja.fin)}
                          </span>
                        </td>
                        {DIAS_SEMANA.map((dia) => {
                          const horario = horarioEnCelda(dia, franja.inicio);

                          return (
                            <td
                              key={`${dia}-${franja.inicio}`}
                              className="border border-gray-200 p-1 align-top"
                            >
                              {horario && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    esGestor && abrirEditar(horario)
                                  }
                                  className={`h-full w-full rounded-md border-l-4 p-2 text-left transition-shadow ${colorMateria(
                                    horario.materia_id,
                                  )} ${
                                    esGestor
                                      ? "hover:shadow-md"
                                      : "cursor-default"
                                  }`}
                                >
                                  <span className="block text-xs font-bold leading-tight">
                                    {horario.materia?.nombre || "Curso"}
                                  </span>
                                  {esGestor && (
                                    <span className="mt-0.5 block truncate text-[10px] text-gray-600">
                                      {horario.seccion?.grado?.nombre}{" "}
                                      {horario.seccion?.nombre}
                                    </span>
                                  )}
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <>
            <Card>
              <Table
                columns={columnas}
                data={horariosDeLaPagina}
                onEdit={permissions.canEdit ? abrirEditar : undefined}
                onDelete={permissions.canDelete ? eliminarHorario : undefined}
              />
            </Card>

            <Pagination
              currentPage={paginaActualLista}
              lastPage={totalPaginasLista}
              total={horariosFiltrados.length}
              perPage={porPagina}
              onPageChange={(pagina) => {
                setPaginaLista(pagina);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </>
        )}

        <Modal
          isOpen={isOpen}
          onClose={close}
          title={editingItem ? "Editar bloque" : "Nuevo bloque de horario"}
          size="lg"
          footer={
            <>
              <Button variant="secondary" onClick={close}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={() => guardarHorario()}>
                Guardar
              </Button>
            </>
          }
        >
          <form onSubmit={guardarHorario} className="space-y-4">
            {error && (
              <Alert
                type="error"
                message={error}
                onClose={() => setError(null)}
              />
            )}

            <SelectBuscable
              label="Sección"
              opciones={opcionesSecciones}
              valor={formulario.seccion_id}
              onChange={(valor) =>
                setFormulario({ ...formulario, seccion_id: valor })
              }
              placeholder="Buscar sección..."
              required
            />

            <SelectBuscable
              label="Curso"
              opciones={opcionesMaterias}
              valor={formulario.materia_id}
              onChange={(valor) =>
                setFormulario({ ...formulario, materia_id: valor })
              }
              placeholder="Buscar curso..."
              required
            />

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Día
              </label>
              <select
                value={formulario.dia}
                onChange={(evento) =>
                  setFormulario({ ...formulario, dia: evento.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar día</option>
                {DIAS_SEMANA.map((dia) => (
                  <option key={dia} value={dia}>
                    {dia}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Bloque académico (45 min)
              </label>
              <div className="flex flex-wrap gap-2">
                {BLOQUES_RAPIDOS.map((bloque) => {
                  const activo =
                    formulario.hora_inicio === bloque.inicio &&
                    formulario.hora_fin === bloque.fin;

                  return (
                    <button
                      key={bloque.inicio}
                      type="button"
                      onClick={() =>
                        aplicarBloqueRapido(bloque.inicio, bloque.fin)
                      }
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        activo
                          ? "border-[#04ADBF] bg-[#04ADBF] text-white"
                          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {bloque.etiqueta}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Hora inicio"
                type="time"
                value={formulario.hora_inicio}
                onChange={(evento) =>
                  setFormulario({
                    ...formulario,
                    hora_inicio: evento.target.value,
                  })
                }
                required
              />
              <Input
                label="Hora fin"
                type="time"
                value={formulario.hora_fin}
                onChange={(evento) =>
                  setFormulario({
                    ...formulario,
                    hora_fin: evento.target.value,
                  })
                }
                required
              />
            </div>
          </form>
        </Modal>
      </div>
    </PermissionGuard>
  );
}
