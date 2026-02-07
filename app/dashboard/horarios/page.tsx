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
  horarioService,
  materiaService,
  seccionService,
  docentePortalService,
  estudiantePortalService,
  padrePortalService,
} from "@/src/lib/services";
import { Horario, Materia, Seccion } from "@/src/types/models";
import { useEffect, useState } from "react";
import { useAuth } from "@/src/features/auth";
import { useErrorHandler } from "@/src/hooks/useErrorHandler";
import { useModalState } from "@/src/hooks/useModalState";
import { usePagination } from "@/src/hooks/usePagination";

export default function HorariosPage() {
  const { user } = useAuth();
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"calendario" | "lista">(
    "calendario",
  );
  const [selectedSeccion, setSelectedSeccion] = useState<string>("");
  const [formData, setFormData] = useState({
    seccion_id: "",
    materia_id: "",
    dia: "",
    hora_inicio: "",
    hora_fin: "",
  });

  // Hooks personalizados
  const { error, success, handleError, handleSuccess, setError } =
    useErrorHandler();
  const { isOpen, editingItem, openCreate, openEdit, close } =
    useModalState<Horario>();
  const pagination = usePagination();

  const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
  const horas = [
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (user?.role === "admin" || user?.role === "auxiliar") {
      fetchDataPaginated();
    }
  }, [pagination.currentPage, pagination.perPage, user]);

  const fetchDataPaginated = async () => {
    try {
      setLoading(true);
      const [horariosData, seccionesData, materiasData] = await Promise.all([
        horarioService.getAll({
          page: pagination.currentPage,
          per_page: pagination.perPage,
        }),
        seccionService.getAll({ all: true }),
        materiaService.getAll({ all: true }),
      ]);

      if (
        horariosData &&
        typeof horariosData === "object" &&
        "data" in horariosData &&
        "current_page" in horariosData
      ) {
        setHorarios(horariosData.data);
        pagination.updatePagination({
          currentPage: horariosData.current_page,
          totalPages: horariosData.last_page || 1,
          totalItems: horariosData.total || 0,
        });
      } else {
        const horariosArray = horariosData?.data || horariosData || [];
        setHorarios(horariosArray);
      }

      setSecciones(
        Array.isArray(seccionesData)
          ? seccionesData
          : seccionesData?.data || [],
      );
      setMaterias(
        Array.isArray(materiasData) ? materiasData : materiasData?.data || [],
      );
    } catch (err) {
      handleError(err, "Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      if (user?.role === "docente") {
        // Docentes obtienen horarios de sus secciones
        const asignacionesData = await docentePortalService.misAsignaciones();
        const asignaciones = asignacionesData.asignaciones || [];

        // Extraer secciones y materias únicas
        const seccionesUnicas = Array.from(
          new Map(
            asignaciones.map((a: any) => [a.seccion.id, a.seccion]),
          ).values(),
        );
        const materiasUnicas = Array.from(
          new Map(
            asignaciones.map((a: any) => [a.materia.id, a.materia]),
          ).values(),
        );

        setSecciones(seccionesUnicas as Seccion[]);
        setMaterias(materiasUnicas as Materia[]);

        // Obtener horarios de esas secciones
        const seccionIds = seccionesUnicas.map((s: any) => s.id);
        const horariosData = await horarioService.getAll();
        const horariosFiltrados = horariosData.filter((h: Horario) =>
          seccionIds.includes(h.seccion_id),
        );
        setHorarios(horariosFiltrados);
      } else if (user?.role === "estudiante") {
        // Estudiantes ven el horario de su sección
        const perfilData = await estudiantePortalService.miPerfil();
        const estudiante = perfilData.estudiante || perfilData;

        if (estudiante?.seccion_id) {
          const [horariosData, materiasData] = await Promise.all([
            horarioService.getAll(),
            materiaService.getAll(),
          ]);

          // Manejar respuesta paginada o sin paginar
          const horariosArray = horariosData?.data || horariosData || [];

          const horariosFiltrados = horariosArray.filter(
            (h: Horario) => h.seccion_id === estudiante.seccion_id,
          );
          setHorarios(horariosFiltrados);
          setSecciones([estudiante.seccion]);
          setMaterias(materiasData || []);
        }
      } else if (user?.role === "padre") {
        // Padres ven horarios de sus hijos
        const hijosData = await padrePortalService.misHijos();
        const hijos = hijosData.hijos || [];

        if (hijos.length > 0) {
          const [horariosData, materiasData] = await Promise.all([
            horarioService.getAll(),
            materiaService.getAll(),
          ]);

          // Manejar respuesta paginada o sin paginar
          const horariosArray = horariosData?.data || horariosData || [];

          const seccionIds = hijos.map((h: any) => h.seccion_id);
          const horariosFiltrados = horariosArray.filter((h: Horario) =>
            seccionIds.includes(h.seccion_id),
          );
          setHorarios(horariosFiltrados);
          setSecciones(hijos.map((h: any) => h.seccion).filter(Boolean));
          setMaterias(materiasData || []);
        }
      } else {
        // Admin/Auxiliar usan endpoints generales con paginación
        const [horariosData, seccionesData, materiasData] = await Promise.all([
          horarioService.getAll({
            page: pagination.currentPage,
            per_page: pagination.perPage,
          }),
          seccionService.getAll({ all: true }),
          materiaService.getAll({ all: true }),
        ]);

        if (
          horariosData &&
          typeof horariosData === "object" &&
          "data" in horariosData &&
          "current_page" in horariosData
        ) {
          setHorarios(horariosData.data);
          pagination.updatePagination({
            currentPage: horariosData.current_page,
            totalPages: horariosData.last_page || 1,
            totalItems: horariosData.total || 0,
          });
        } else {
          const horariosArray = horariosData?.data || horariosData || [];
          setHorarios(horariosArray);
        }

        setSecciones(
          Array.isArray(seccionesData)
            ? seccionesData
            : seccionesData?.data || [],
        );
        setMaterias(
          Array.isArray(materiasData) ? materiasData : materiasData?.data || [],
        );
      }
    } catch (err) {
      handleError(err, "Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      seccion_id: "",
      materia_id: "",
      dia: "",
      hora_inicio: "",
      hora_fin: "",
    });
    openCreate();
  };

  const handleEdit = (item: Horario) => {
    setFormData({
      seccion_id: item.seccion_id.toString(),
      materia_id: item.materia_id.toString(),
      dia: item.dia,
      hora_inicio: item.hora_inicio,
      hora_fin: item.hora_fin,
    });
    openEdit(item);
  };

  const handleDelete = async (item: Horario) => {
    if (!confirm("¿Estás seguro de eliminar este horario?")) return;

    try {
      await horarioService.delete(item.id);
      handleSuccess("Horario eliminado correctamente");
      fetchData();
    } catch (err) {
      handleError(err, "Error al eliminar el horario");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        seccion_id: parseInt(formData.seccion_id),
        materia_id: parseInt(formData.materia_id),
        dia: formData.dia,
        hora_inicio: formData.hora_inicio,
        hora_fin: formData.hora_fin,
      };

      if (editingItem) {
        await horarioService.update(editingItem.id, data);
        handleSuccess("Horario actualizado correctamente");
      } else {
        await horarioService.create(data);
        handleSuccess("Horario creado correctamente");
      }

      close();
      fetchData();
    } catch (err) {
      handleError(err, "Error al guardar el horario");
    }
  };

  const horariosFiltrados = selectedSeccion
    ? horarios.filter((h) => h.seccion_id.toString() === selectedSeccion)
    : horarios;

  const getHorarioParaCelda = (dia: string, hora: string) => {
    return horariosFiltrados.find((h) => {
      if (h.dia !== dia) return false;

      // Extraer la hora de inicio (formato HH:MM)
      const horaInicio = h.hora_inicio.substring(0, 5); // "08:45"
      const [horaInicioHH] = horaInicio.split(":"); // "08"
      const [horaHH] = hora.split(":"); // "08"

      // Buscar horarios que comiencen en esta franja horaria
      return horaInicioHH === horaHH;
    });
  };

  const getColorMateria = (materiaId: number) => {
    const colors = [
      "bg-blue-100 border-blue-300 text-blue-800",
      "bg-green-100 border-green-300 text-green-800",
      "bg-yellow-100 border-yellow-300 text-yellow-800",
      "bg-purple-100 border-purple-300 text-purple-800",
      "bg-pink-100 border-pink-300 text-pink-800",
      "bg-indigo-100 border-indigo-300 text-indigo-800",
      "bg-red-100 border-red-300 text-red-800",
      "bg-orange-100 border-orange-300 text-orange-800",
    ];
    return colors[materiaId % colors.length];
  };

  const columns = [
    { key: "id", label: "ID" },
    {
      key: "seccion",
      label: "Sección",
      render: (value: unknown) => {
        const seccion = value as Seccion;
        return `${seccion?.nombre} - ${seccion?.grado?.nombre}` || "N/A";
      },
    },
    {
      key: "materia",
      label: "Materia",
      render: (value: unknown) => (value as Materia)?.nombre || "N/A",
    },
    { key: "dia", label: "Día" },
    { key: "hora_inicio", label: "Hora Inicio" },
    { key: "hora_fin", label: "Hora Fin" },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Horarios</h1>
          <p className="text-gray-600 mt-2">Gestión de horarios de clases</p>
        </div>
        {(user?.role === "admin" || user?.role === "auxiliar") && (
          <Button variant="primary" onClick={handleCreate}>
            + Nuevo Horario
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

      {/* Controles */}
      <Card>
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("calendario")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === "calendario"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Vista Calendario
            </button>
            <button
              onClick={() => setViewMode("lista")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === "lista"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Vista Lista
            </button>
          </div>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedSeccion}
            onChange={(e) => setSelectedSeccion(e.target.value)}
          >
            <option value="">Todas las secciones</option>
            {secciones.map((seccion, index) => (
              <option key={`${seccion.id}-${index}`} value={seccion.id}>
                {seccion.nombre} - {seccion.grado?.nombre}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Vista Calendario */}
      {viewMode === "calendario" ? (
        <Card>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando horarios...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-blue-500">
                    <th className="sticky left-0 z-10 bg-blue-600 border border-blue-400 px-2 py-2 text-left text-xs font-bold text-white w-16">
                      HORA
                    </th>
                    {dias.map((dia) => (
                      <th
                        key={dia}
                        className="border border-blue-400 px-2 py-2 text-center text-xs font-bold text-white uppercase min-w-[140px]"
                      >
                        {dia}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {horas.map((hora, idx) => (
                    <tr
                      key={hora}
                      className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                    >
                      <td className="sticky left-0 z-10 border border-gray-300 px-2 py-2 text-xs font-bold text-gray-800 whitespace-nowrap bg-gradient-to-r from-gray-100 to-gray-50">
                        {hora}
                      </td>
                      {dias.map((dia) => {
                        const horario = getHorarioParaCelda(dia, hora);
                        return (
                          <td
                            key={`${dia}-${hora}`}
                            className="border border-gray-300 p-1 align-top h-20"
                          >
                            {horario && (
                              <div
                                className={`${getColorMateria(
                                  horario.materia_id,
                                )} border-l-4 rounded-lg p-2 h-full cursor-pointer hover:shadow-lg transition-all`}
                                onClick={() =>
                                  (user?.role === "admin" ||
                                    user?.role === "auxiliar") &&
                                  handleEdit(horario)
                                }
                              >
                                <div className="font-bold text-xs mb-0.5 line-clamp-2">
                                  {horario.materia?.nombre}
                                </div>
                                {(user?.role === "admin" ||
                                  user?.role === "auxiliar") && (
                                  <div className="text-[10px] text-gray-700 mb-0.5 truncate">
                                    {horario.seccion?.nombre} -{" "}
                                    {horario.seccion?.grado?.nombre}
                                  </div>
                                )}
                                <div className="text-[10px] font-medium text-gray-600">
                                  {horario.hora_inicio.substring(0, 5)} -{" "}
                                  {horario.hora_fin.substring(0, 5)}
                                </div>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              {horariosFiltrados.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No hay horarios registrados
                  {selectedSeccion ? " para esta sección" : ""}
                </div>
              )}
            </div>
          )}
        </Card>
      ) : (
        <>
          <Card>
            <Table
              columns={columns}
              data={horariosFiltrados}
              loading={loading}
              onEdit={
                user?.role === "admin" || user?.role === "auxiliar"
                  ? handleEdit
                  : undefined
              }
              onDelete={
                user?.role === "admin" || user?.role === "auxiliar"
                  ? handleDelete
                  : undefined
              }
            />
          </Card>

          {(user?.role === "admin" || user?.role === "auxiliar") &&
            pagination.totalItems > 0 && (
              <Pagination
                currentPage={pagination.currentPage}
                lastPage={pagination.totalPages}
                total={pagination.totalItems}
                perPage={pagination.perPage}
                onPageChange={(page) => {
                  pagination.goToPage(page);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onPerPageChange={(newPerPage) => {
                  pagination.updatePagination({ perPage: newPerPage });
                }}
              />
            )}
        </>
      )}

      <Modal
        isOpen={isOpen}
        onClose={close}
        title={editingItem ? "Editar Horario" : "Nuevo Horario"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={close}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              Guardar
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Sección
            </label>
            <select
              value={formData.seccion_id}
              onChange={(e) =>
                setFormData({ ...formData, seccion_id: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar sección</option>
              {secciones?.map((seccion) => (
                <option key={seccion.id} value={seccion.id}>
                  {seccion.nombre} - {seccion.grado?.nombre}
                </option>
              ))}
            </select>
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
              Día
            </label>
            <select
              value={formData.dia}
              onChange={(e) =>
                setFormData({ ...formData, dia: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar día</option>
              {dias?.map((dia) => (
                <option key={dia} value={dia}>
                  {dia}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Hora Inicio"
              type="time"
              value={formData.hora_inicio}
              onChange={(e) =>
                setFormData({ ...formData, hora_inicio: e.target.value })
              }
              required
            />
            <Input
              label="Hora Fin"
              type="time"
              value={formData.hora_fin}
              onChange={(e) =>
                setFormData({ ...formData, hora_fin: e.target.value })
              }
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
