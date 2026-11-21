"use client";

import {
  Alert,
  Button,
  Card,
  Input,
  Modal,
  Table,
  Pagination,
} from "@/src/components/ui";
import {
  calificacionService,
  estudianteService,
  materiaService,
  periodoService,
  docentePortalService,
  estudiantePortalService,
} from "@/src/lib/services";
import {
  Calificacion,
  Estudiante,
  Materia,
  PeriodoAcademico,
} from "@/src/types/models";
import { useEffect, useState } from "react";
import { useAuth } from "@/src/features/auth";
import EstadisticasAvanzadas from "./components/EstadisticasAvanzadas";
import { useRouter } from "next/navigation";
import { useErrorHandler } from "@/src/hooks/useErrorHandler";
import { usePermissions } from "@/src/hooks/usePermissions";
import { PermissionGuard } from "@/src/components/auth";
import { UserRole } from "@/src/types";
import { useModalState } from "@/src/hooks/useModalState";
import { usePagination } from "@/src/hooks/usePagination";

const obtenerPeriodosVigentes = (datos: unknown): PeriodoAcademico[] => {
  const lista = (
    Array.isArray(datos)
      ? datos
      : (datos as { data?: PeriodoAcademico[] })?.data || []
  ) as PeriodoAcademico[];
  const anioActual = new Date().getFullYear();

  return lista.filter((periodo) => !periodo.anio || periodo.anio <= anioActual);
};

export default function CalificacionesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const permissions = usePermissions("calificaciones");
  const { error, success, setError, setSuccess, handleError } =
    useErrorHandler();
  const {
    isOpen: isModalOpen,
    open: openModal,
    close: closeModal,
  } = useModalState();
  const {
    currentPage,
    perPage,
    setCurrentPage,
    setPerPage,
    setPaginationData,
    paginationData,
  } = usePagination();

  // Redirigir a padres a su página específica
  useEffect(() => {
    if (user?.role === "padre") {
      router.push("/dashboard/padre/calificaciones");
    }
  }, [user, router]);

  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [periodos, setPeriodos] = useState<PeriodoAcademico[]>([]);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingEstadisticas, setLoadingEstadisticas] = useState(false);
  const [editingItem, setEditingItem] = useState<Calificacion | null>(null);
  const [formData, setFormData] = useState({
    estudiante_id: "",
    materia_id: "",
    periodo_academico_id: "",
    nota: "",
    observaciones: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [busquedaEstudiante, setBusquedaEstudiante] = useState("");
  const [filterMateria, setFilterMateria] = useState("");
  const [filterPeriodo, setFilterPeriodo] = useState("");
  const [mostrarEstadisticas, setMostrarEstadisticas] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const listadoPaginadoEnServidor =
    user?.role === "admin" || user?.role === "auxiliar";

  useEffect(() => {
    const demora = searchTerm || filterMateria || filterPeriodo ? 400 : 0;
    const temporizador = setTimeout(() => {
      fetchData();
    }, demora);

    return () => clearTimeout(temporizador);
  }, [currentPage, perPage, searchTerm, filterMateria, filterPeriodo]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterMateria, filterPeriodo]);

  useEffect(() => {
    if (user?.role === "admin" || user?.role === "auxiliar") {
      fetchEstadisticas();
    }
  }, [filterPeriodo]);

  const fetchEstadisticas = async () => {
    if (user?.role !== "admin" && user?.role !== "auxiliar") return;

    try {
      setLoadingEstadisticas(true);
      const periodo_id = filterPeriodo ? parseInt(filterPeriodo) : undefined;
      const response =
        await calificacionService.estadisticasAvanzadas(periodo_id);
      setEstadisticas(response);
    } catch (err) {
      handleError(err, "Error al cargar estadísticas");
    } finally {
      setLoadingEstadisticas(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      if (user?.role === "docente") {
        // Docentes usan endpoints del portal
        const [
          calificacionesData,
          estudiantesData,
          asignacionesData,
          periodosData,
        ] = (await Promise.all([
          docentePortalService.misCalificaciones(),
          docentePortalService.misEstudiantes(),
          docentePortalService.misAsignaciones(),
          periodoService.getAll(),
        ])) as any[];

        setCalificaciones(calificacionesData.calificaciones || []);
        setEstudiantes(estudiantesData.estudiantes || []);

        // Extraer materias únicas usando Map
        const materiasMap = new Map();
        asignacionesData.asignaciones?.forEach((a: any) => {
          if (a.materia && !materiasMap.has(a.materia.id)) {
            materiasMap.set(a.materia.id, a.materia);
          }
        });
        const materiasUnicas = Array.from(materiasMap.values());
        setMaterias(materiasUnicas);
        setPeriodos(obtenerPeriodosVigentes(periodosData));
      } else if (user?.role === "estudiante") {
        // Estudiantes ven solo sus propias calificaciones
        const [calificacionesData, periodosData] = (await Promise.all([
          estudiantePortalService.misCalificaciones(),
          periodoService.getAll(),
        ])) as any[];

        setCalificaciones(calificacionesData.calificaciones || []);
        setEstudiantes([]);
        setMaterias([]);
        setPeriodos(obtenerPeriodosVigentes(periodosData));
      } else if (user?.role === "admin" || user?.role === "auxiliar") {
        // Admin/Auxiliar usan endpoints generales con paginación
        const [
          calificacionesData,
          estudiantesData,
          materiasData,
          periodosData,
        ] = await Promise.all([
          calificacionService.buscar({
            page: currentPage,
            per_page: perPage,
            buscar: searchTerm.trim() || undefined,
            materia_id: filterMateria ? parseInt(filterMateria) : undefined,
            periodo_academico_id: filterPeriodo
              ? parseInt(filterPeriodo)
              : undefined,
          }),
          estudianteService.getAll({ all: true }),
          materiaService.getAll({ all: true }),
          periodoService.getAll({ all: true }),
        ]);

        // Manejar respuesta paginada
        if (
          calificacionesData &&
          typeof calificacionesData === "object" &&
          "data" in calificacionesData &&
          "current_page" in calificacionesData
        ) {
          setCalificaciones(calificacionesData.data);
          setPaginationData({
            total: calificacionesData.total || 0,
            lastPage: calificacionesData.last_page || 1,
          });
        } else {
          const calificacionesArray = Array.isArray(calificacionesData)
            ? calificacionesData
            : (calificacionesData as any)?.data || [];
          setCalificaciones(calificacionesArray);
        }

        setEstudiantes(
          Array.isArray(estudiantesData)
            ? estudiantesData
            : estudiantesData?.data || [],
        );
        setMaterias(
          Array.isArray(materiasData) ? materiasData : materiasData?.data || [],
        );
        setPeriodos(obtenerPeriodosVigentes(periodosData));
      } else {
        handleError(null, "No tiene permisos para ver calificaciones");
      }
    } catch (err) {
      handleError(err, "Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({
      estudiante_id: "",
      materia_id: "",
      periodo_academico_id: "",
      nota: "",
      observaciones: "",
    });
    openModal();
  };

  const handleEdit = (item: Calificacion) => {
    setEditingItem(item);
    setFormData({
      estudiante_id: item.estudiante_id.toString(),
      materia_id: item.materia_id.toString(),
      periodo_academico_id: item.periodo_academico_id.toString(),
      nota: item.nota.toString(),
      observaciones: item.observaciones || "",
    });
    openModal();
  };

  const handleDelete = async (item: Calificacion) => {
    if (!confirm("¿Estás seguro de eliminar esta calificación?")) return;

    try {
      await calificacionService.delete(item.id);
      setSuccess("Calificación eliminada correctamente");
      fetchData();
    } catch (err) {
      handleError(err, "Error al eliminar la calificación");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (enviando) return;

    if (!editingItem && !formData.estudiante_id) {
      setError("Selecciona un estudiante de la lista.");
      return;
    }

    setEnviando(true);

    try {
      const nota = parseFloat(formData.nota);
      const observaciones = formData.observaciones.trim();

      if (
        editingItem &&
        (user?.role === "admin" || user?.role === "auxiliar")
      ) {
        await calificacionService.update(editingItem.id, {
          nota,
          ...(observaciones ? { observaciones } : {}),
        });
        setSuccess("Calificación actualizada correctamente");
        closeModal();
        fetchData();
        return;
      }

      const data = {
        estudiante_id: parseInt(formData.estudiante_id),
        materia_id: parseInt(formData.materia_id),
        periodo_academico_id: parseInt(formData.periodo_academico_id),
        nota,
      };

      if (user?.role === "docente") {
        // Docentes usan el endpoint específico
        await docentePortalService.registrarCalificacion(data);
        setSuccess(
          editingItem
            ? "Calificación actualizada correctamente"
            : "Calificación registrada correctamente",
        );
      } else {
        await calificacionService.create(data);
        setSuccess("Calificación creada correctamente");
      }

      closeModal();
      fetchData();
    } catch (err) {
      handleError(err, "Error al guardar la calificación");
    } finally {
      setEnviando(false);
    }
  };

  // Filtrado de calificaciones
  const normalizarTexto = (texto: string) =>
    texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const terminoEstudiante = normalizarTexto(busquedaEstudiante.trim());
  const estudiantesSugeridos = terminoEstudiante
    ? (estudiantes || [])
        .filter((estudiante) => {
          const base = normalizarTexto(
            `${estudiante.nombres} ${estudiante.apellido_paterno} ${estudiante.apellido_materno} ${estudiante.dni || ""}`,
          );
          return terminoEstudiante
            .split(/\s+/)
            .every((palabra) => base.includes(palabra));
        })
        .slice(0, 8)
    : [];

  const estudianteElegido = (estudiantes || []).find(
    (estudiante) => String(estudiante.id) === formData.estudiante_id,
  );

  const calificacionesFiltradas = listadoPaginadoEnServidor
    ? calificaciones
    : calificaciones.filter((calificacion) => {
        const estudiante = calificacion.estudiante as any;
        const nombreCompleto = [
          estudiante?.nombres,
          estudiante?.apellido_paterno,
          estudiante?.apellido_materno,
          estudiante?.nombre_completo,
          estudiante?.dni,
          (calificacion.materia as any)?.nombre,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const termino = searchTerm.trim().toLowerCase();
        const matchesSearch = !termino || nombreCompleto.includes(termino);
        const matchesMateria =
          !filterMateria ||
          calificacion.materia_id?.toString() === filterMateria;
        const matchesPeriodo =
          !filterPeriodo ||
          calificacion.periodo_academico_id?.toString() === filterPeriodo;
        return matchesSearch && matchesMateria && matchesPeriodo;
      });

  const columns = [
    { key: "id", label: "ID" },
    {
      key: "estudiante",
      label: "Estudiante",
      render: (value: unknown) => {
        const estudiante = value as Estudiante;
        const nombreCompleto =
          estudiante?.nombre_completo ||
          `${estudiante?.apellido_paterno || ""} ${estudiante?.apellido_materno || ""}, ${estudiante?.nombres || ""}`.trim();

        return (
          <div>
            <div className="font-medium">{nombreCompleto || "N/A"}</div>
            {estudiante?.dni && (
              <div className="text-sm text-gray-500">DNI: {estudiante.dni}</div>
            )}
          </div>
        );
      },
    },
    {
      key: "materia",
      label: "Materia",
      render: (value: unknown) => (value as Materia)?.nombre || "N/A",
    },
    {
      key: "periodo_academico",
      label: "Periodo",
      render: (value: unknown) => (value as PeriodoAcademico)?.nombre || "N/A",
    },
    {
      key: "nota",
      label: "Nota",
      render: (value: unknown) => {
        const nota = value as number;
        return (
          <span
            className={`font-bold ${
              nota >= 14
                ? "text-green-600"
                : nota >= 11
                  ? "text-yellow-600"
                  : "text-red-600"
            }`}
          >
            {nota}
          </span>
        );
      },
    },
  ];

  return (
    <PermissionGuard
      requiredRoles={[
        UserRole.ADMIN,
        UserRole.AUXILIAR,
        UserRole.DOCENTE,
        UserRole.ESTUDIANTE,
        UserRole.PADRE,
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Calificaciones</h1>
            <p className="text-gray-600 mt-2">
              Gestión de calificaciones de estudiantes
            </p>
          </div>
          <div className="flex gap-2">
            {(user?.role === "admin" || user?.role === "auxiliar") && (
              <Button
                variant="secondary"
                onClick={() => setMostrarEstadisticas(!mostrarEstadisticas)}
              >
                {mostrarEstadisticas ? "Ocultar" : "Mostrar"} Estadísticas
              </Button>
            )}
            {permissions.canCreate && (
              <Button variant="primary" onClick={handleCreate}>
                + Nueva Calificación
              </Button>
            )}
          </div>
        </div>

        {success && (
          <Alert
            type="success"
            message={success}
            onClose={() => setSuccess(null)}
          />
        )}

        {/* Estadísticas Avanzadas */}
        {(user?.role === "admin" || user?.role === "auxiliar") &&
          mostrarEstadisticas && (
            <>
              {loadingEstadisticas ? (
                <Card>
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">
                      Cargando estadísticas...
                    </p>
                  </div>
                </Card>
              ) : estadisticas ? (
                <EstadisticasAvanzadas estadisticas={estadisticas} />
              ) : null}
            </>
          )}

        {/* Filtros de búsqueda */}
        <Card>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <Input
              placeholder="Buscar por estudiante o materia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <select
              value={filterMateria}
              onChange={(e) => setFilterMateria(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las materias</option>
              {materias?.map((materia) => (
                <option key={materia.id} value={materia.id}>
                  {materia.nombre}
                </option>
              ))}
            </select>
            <select
              value={filterPeriodo}
              onChange={(e) => setFilterPeriodo(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los periodos</option>
              {periodos?.map((periodo) => (
                <option key={periodo.id} value={periodo.id}>
                  {periodo.nombre} - {periodo.anio}
                </option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-600">
            Mostrando {calificacionesFiltradas.length} de{" "}
            {calificaciones.length} calificaciones
          </div>
        </Card>

        <Card>
          <Table
            columns={columns}
            data={calificacionesFiltradas}
            loading={loading}
            onEdit={permissions.canEdit ? handleEdit : undefined}
            onDelete={permissions.canDelete ? handleDelete : undefined}
          />
        </Card>

        {(user?.role === "admin" || user?.role === "auxiliar") && (
          <Pagination
            currentPage={currentPage}
            lastPage={paginationData.lastPage}
            total={paginationData.total}
            perPage={perPage}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onPerPageChange={(newPerPage) => {
              setPerPage(newPerPage);
              setCurrentPage(1);
            }}
          />
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            closeModal();
            setError(null);
          }}
          title={editingItem ? "Editar Calificación" : "Nueva Calificación"}
          size="lg"
          footer={
            <>
              <Button variant="secondary" onClick={closeModal}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={enviando}
              >
                {enviando ? "Guardando..." : "Guardar"}
              </Button>
            </>
          }
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert
                type="error"
                message={error}
                onClose={() => setError(null)}
              />
            )}
            {editingItem ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    Estudiante
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {(editingItem.estudiante as Estudiante)?.nombre_completo ||
                      `${(editingItem.estudiante as Estudiante)?.apellido_paterno || ""} ${(editingItem.estudiante as Estudiante)?.apellido_materno || ""}, ${(editingItem.estudiante as Estudiante)?.nombres || ""}`.trim() ||
                      "N/A"}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    Materia
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {(editingItem.materia as Materia)?.nombre || "N/A"}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg md:col-span-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    Periodo académico
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {(editingItem.periodo_academico as PeriodoAcademico)
                      ?.nombre || "N/A"}
                  </p>
                </div>
                <p className="md:col-span-2 text-xs text-gray-500">
                  El estudiante, la materia y el periodo no se modifican desde
                  aquí. Solo puede corregir el resultado de la evaluación.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Estudiante
                  </label>
                  {formData.estudiante_id && estudianteElegido ? (
                    <div className="flex items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
                      <span className="text-sm font-medium text-gray-900">
                        {`${estudianteElegido.apellido_paterno || ""} ${estudianteElegido.apellido_materno || ""}, ${estudianteElegido.nombres || ""}`}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, estudiante_id: "" })
                        }
                        className="text-xs font-semibold text-blue-700 hover:underline"
                      >
                        Cambiar
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={busquedaEstudiante}
                        onChange={(e) => setBusquedaEstudiante(e.target.value)}
                        placeholder="Escribe apellido, nombre o DNI"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {busquedaEstudiante.trim() !== "" && (
                        <div className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-gray-200">
                          {estudiantesSugeridos.length === 0 ? (
                            <p className="px-3 py-2 text-sm text-gray-500">
                              Sin coincidencias
                            </p>
                          ) : (
                            estudiantesSugeridos.map((estudiante) => (
                              <button
                                key={estudiante.id}
                                type="button"
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    estudiante_id: String(estudiante.id),
                                  });
                                  setBusquedaEstudiante("");
                                }}
                                className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                              >
                                <span className="font-medium text-gray-900">
                                  {`${estudiante.apellido_paterno || ""} ${estudiante.apellido_materno || ""}, ${estudiante.nombres || ""}`}
                                </span>
                                {estudiante.dni && (
                                  <span className="ml-2 text-xs text-gray-500">
                                    DNI {estudiante.dni}
                                  </span>
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Materia
                  </label>
                  <select
                    value={formData.materia_id}
                    onChange={(e) =>
                      setFormData({ ...formData, materia_id: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleccionar materia</option>
                    {materias?.map((materia) => (
                      <option key={materia.id} value={materia.id}>
                        {materia.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Periodo Académico
                  </label>
                  <select
                    value={formData.periodo_academico_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        periodo_academico_id: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleccionar periodo</option>
                    {periodos?.map((periodo) => (
                      <option key={periodo.id} value={periodo.id}>
                        {periodo.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <Input
              label="Nota (0-20)"
              type="number"
              min="0"
              max="20"
              step="0.5"
              value={formData.nota}
              onChange={(e) =>
                setFormData({ ...formData, nota: e.target.value })
              }
              required
            />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Observaciones (opcional)
              </label>
              <textarea
                value={formData.observaciones}
                onChange={(e) =>
                  setFormData({ ...formData, observaciones: e.target.value })
                }
                rows={3}
                maxLength={500}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Observaciones sobre el desempeño del estudiante"
              />
            </div>
          </form>
        </Modal>
      </div>
    </PermissionGuard>
  );
}
