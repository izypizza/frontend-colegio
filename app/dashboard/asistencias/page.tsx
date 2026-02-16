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
  asistenciaService,
  estudianteService,
  materiaService,
  docentePortalService,
} from "@/src/lib/services";
import { Asistencia, Estudiante, Materia } from "@/src/types/models";
import { useEffect, useState } from "react";
import { useAuth } from "@/src/features/auth";
import { useErrorHandler } from "@/src/hooks/useErrorHandler";
import { useModalState } from "@/src/hooks/useModalState";
import { usePagination } from "@/src/hooks/usePagination";

export default function AsistenciasPage() {
  const { user } = useAuth();
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
  } = usePagination(100);

  // Verificar que el usuario tenga un rol autorizado
  const rolesAutorizados = ["admin", "auxiliar", "docente"];
  const tieneAcceso = user && rolesAutorizados.includes(user.role);

  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Asistencia | null>(null);
  const [formData, setFormData] = useState({
    estudiante_id: "",
    materia_id: "",
    fecha: "",
    estado: "presente" as "presente" | "tarde" | "ausente",
    observaciones: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMateria, setFilterMateria] = useState("");
  const [filterEstado, setFilterEstado] = useState("");

  // Filtros de fecha optimizados
  const currentYear = new Date().getFullYear();
  const [filterMes, setFilterMes] = useState("");
  const [filterDia, setFilterDia] = useState("");
  const [filterAnio, setFilterAnio] = useState(currentYear.toString());

  const totalRegistros =
    paginationData.total > 0 ? paginationData.total : asistencias.length;

  const handleExportExcel = () => {
    try {
      if (asistenciasFiltradas.length === 0) {
        setError("No hay datos para exportar");
        return;
      }

      // Preparar datos para Excel
      const dataToExport = asistenciasFiltradas.map((asist) => ({
        ID: asist.id,
        Estudiante: (asist.estudiante as any)?.nombre || "N/A",
        DNI: (asist.estudiante as any)?.dni || "",
        Materia: (asist.materia as any)?.nombre || "N/A",
        Fecha: new Date(asist.fecha).toLocaleDateString("es-PE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
        Estado:
          asist.estado === "presente"
            ? "Presente"
            : asist.estado === "tarde"
              ? "Llegó Tarde"
              : "Ausente",
      }));

      // Crear CSV con formato UTF-8 BOM para Excel
      const headers = Object.keys(dataToExport[0]);
      const csvRows = [
        headers.join(","), // Headers
        ...dataToExport.map((row) =>
          headers
            .map((header) => {
              const value = row[header as keyof typeof row] || "";
              // Escapar comillas y envolver en comillas si contiene coma
              return `"${String(value).replace(/"/g, '""')}"`;
            })
            .join(","),
        ),
      ];
      const csvContent = csvRows.join("\r\n"); // Usar CRLF para mejor compatibilidad con Excel

      // Descargar archivo con BOM UTF-8
      const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = `asistencias_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccess(
        `Archivo exportado correctamente (${asistenciasFiltradas.length} registros)`,
      );
    } catch (err) {
      handleError(err, "Error al exportar el archivo");
    }
  };
  const loadDocenteData = async () => {
    try {
      setLoading(true);
      const [asistenciasData, estudiantesData, asignacionesData] =
        await Promise.all([
          docentePortalService.misAsistencias(),
          docentePortalService.misEstudiantes(),
          docentePortalService.misAsignaciones(),
        ]);

      setAsistencias(
        Array.isArray(asistenciasData.asistencias)
          ? asistenciasData.asistencias
          : [],
      );
      setEstudiantes(
        Array.isArray(estudiantesData.estudiantes)
          ? estudiantesData.estudiantes
          : [],
      );

      const materiasMap = new Map();
      asignacionesData.asignaciones?.forEach((a: any) => {
        if (a.materia && !materiasMap.has(a.materia.id)) {
          materiasMap.set(a.materia.id, a.materia);
        }
      });
      setMaterias(Array.from(materiasMap.values()));

      setPaginationData({
        total: asistenciasData.asistencias?.length || 0,
        lastPage: 1,
      });
    } catch (err: any) {
      handleError(err, "Error al cargar los datos del docente");
    } finally {
      setLoading(false);
    }
  };

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [asistenciasData, estudiantesData, materiasData] =
        await Promise.all([
          asistenciaService.getAll({ page: currentPage, per_page: perPage }),
          estudianteService.getAll({ all: true }),
          materiaService.getAll({ all: true }),
        ]);

      if (
        asistenciasData &&
        typeof asistenciasData === "object" &&
        "data" in asistenciasData &&
        "current_page" in asistenciasData
      ) {
        setAsistencias(asistenciasData.data);
        setPaginationData({
          total: asistenciasData.total || 0,
          lastPage: asistenciasData.last_page || 1,
        });
      } else {
        const asistenciasArray = asistenciasData?.data || asistenciasData || [];
        setAsistencias(asistenciasArray);
        setPaginationData({
          total: Array.isArray(asistenciasArray) ? asistenciasArray.length : 0,
          lastPage: 1,
        });
      }

      setEstudiantes(
        Array.isArray(estudiantesData)
          ? estudiantesData
          : estudiantesData?.data || [],
      );
      setMaterias(
        Array.isArray(materiasData) ? materiasData : materiasData?.data || [],
      );
    } catch (err: any) {
      handleError(err, "Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    if (!user) return;
    if (user.role === "docente") {
      await loadDocenteData();
    } else {
      await loadAdminData();
    }
  };

  useEffect(() => {
    if (!user) return;

    const rolesPermitidos = ["admin", "auxiliar", "docente"];
    if (!rolesPermitidos.includes(user.role)) {
      setError(
        `No tienes permisos para acceder a esta sección. Tu rol actual es: ${user.role}`,
      );
      setLoading(false);
      return;
    }

    if (user.role === "docente") {
      loadDocenteData();
    } else {
      loadAdminData();
    }
  }, [user, currentPage, perPage]);

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({
      estudiante_id: "",
      materia_id: "",
      fecha: new Date().toISOString().split("T")[0],
      estado: "presente",
      observaciones: "",
    });
    openModal();
  };

  const handleEdit = (item: Asistencia) => {
    setEditingItem(item);
    setFormData({
      estudiante_id: item.estudiante_id.toString(),
      materia_id: item.materia_id.toString(),
      fecha: item.fecha.split("T")[0], // Convertir a yyyy-MM-dd
      estado: item.estado || "presente",
      observaciones: item.observaciones || "",
    });
    openModal();
  };

  const handleDelete = async (item: Asistencia) => {
    if (!confirm("¿Estás seguro de eliminar este registro de asistencia?"))
      return;

    try {
      await asistenciaService.delete(item.id);
      setSuccess("Asistencia eliminada correctamente");
      refreshData();
    } catch (err) {
      handleError(err, "Error al eliminar la asistencia");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        estudiante_id: parseInt(formData.estudiante_id),
        materia_id: parseInt(formData.materia_id),
        fecha: formData.fecha,
        estado: formData.estado,
        observaciones: formData.observaciones || undefined,
      };

      if (user?.role === "docente") {
        // Docentes usan el endpoint específico
        await docentePortalService.registrarAsistencia(data);
        setSuccess(
          editingItem
            ? "Asistencia actualizada correctamente"
            : "Asistencia registrada correctamente",
        );
      } else {
        // Admin/Auxiliar usan endpoints generales
        if (editingItem) {
          await asistenciaService.update(editingItem.id, data);
          setSuccess("Asistencia actualizada correctamente");
        } else {
          await asistenciaService.create(data);
          setSuccess("Asistencia creada correctamente");
        }
      }

      closeModal();
      setFormData({
        estudiante_id: "",
        materia_id: "",
        fecha: "",
        estado: "presente",
        observaciones: "",
      });
      setEditingItem(null);
      refreshData();
    } catch (err: any) {
      handleError(err, "Error al guardar la asistencia");
    }
  };

  // Filtrado de asistencias
  const asistenciasFiltradas = asistencias.filter((asistencia) => {
    const estudianteNombre =
      (asistencia.estudiante?.nombres || "") +
      " " +
      (asistencia.estudiante?.apellido_paterno || "");
    const materiaNombre = asistencia.materia?.nombre || "";

    const matchesSearch =
      !searchTerm ||
      estudianteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      materiaNombre.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMateria =
      !filterMateria || asistencia.materia_id?.toString() === filterMateria;

    const matchesEstado = !filterEstado || asistencia.estado === filterEstado;

    // Filtros de fecha
    const fechaAsistencia = new Date(asistencia.fecha);
    const matchesAnio =
      !filterAnio || fechaAsistencia.getFullYear().toString() === filterAnio;
    const matchesMes =
      !filterMes || (fechaAsistencia.getMonth() + 1).toString() === filterMes;
    const matchesDia =
      !filterDia || fechaAsistencia.getDate().toString() === filterDia;

    return (
      matchesSearch &&
      matchesMateria &&
      matchesEstado &&
      matchesAnio &&
      matchesMes &&
      matchesDia
    );
  });

  const columns = [
    { key: "id", label: "ID" },
    {
      key: "estudiante",
      label: "Estudiante",
      render: (value: unknown) => {
        const estudiante = value as Estudiante;
        return (
          <div>
            <div className="font-medium">{estudiante?.nombre || "N/A"}</div>
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
      key: "fecha",
      label: "Fecha",
      render: (value: unknown) =>
        new Date(value as string).toLocaleDateString("es-PE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
    },
    {
      key: "estado",
      label: "Estado",
      render: (value: unknown, asistencia: Asistencia) => {
        const estado = asistencia.estado || "presente";
        const badgeStyles = {
          presente: "bg-green-100 text-green-800",
          tarde: "bg-yellow-100 text-yellow-800",
          ausente: "bg-red-100 text-red-800",
        };
        const labels = {
          presente: "Presente",
          tarde: "Llegó Tarde",
          ausente: "Ausente",
        };
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeStyles[estado]}`}
          >
            {labels[estado]}
          </span>
        );
      },
    },
    {
      key: "acciones",
      label: "Acciones",
      render: (_value: unknown, asistencia: Asistencia) => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleEdit(asistencia)}
          >
            Editar
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(asistencia)}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  // Renderizado condicional si el usuario no tiene acceso
  if (!user) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="p-8 text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Autenticación requerida
            </h3>
            <p className="text-gray-600">
              Debes iniciar sesión para acceder a esta página.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (!tieneAcceso) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="p-8 text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Acceso denegado
            </h3>
            <p className="text-gray-600 mb-2">
              No tienes permisos para acceder a esta página.
            </p>
            <p className="text-sm text-gray-500">
              Tu rol actual: <span className="font-semibold">{user.role}</span>
            </p>
            <p className="text-sm text-gray-500">
              Roles requeridos: Admin, Auxiliar o Docente
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Asistencias</h1>
          <p className="text-gray-600 mt-2">
            Gestión de asistencias de estudiantes
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleExportExcel}>
            Exportar Excel
          </Button>
          <Button variant="primary" onClick={handleCreate}>
            + Registrar Asistencia
          </Button>
        </div>
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

      {/* Filtros de búsqueda */}
      <Card>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
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
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="presente">Presente</option>
              <option value="tarde">Llegó Tarde</option>
              <option value="ausente">Ausente</option>
            </select>
          </div>

          {/* Filtros de fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Año
              </label>
              <select
                value={filterAnio}
                onChange={(e) => setFilterAnio(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={currentYear}>{currentYear} (Actual)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mes
              </label>
              <select
                value={filterMes}
                onChange={(e) => setFilterMes(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los meses</option>
                <option value="1">Enero</option>
                <option value="2">Febrero</option>
                <option value="3">Marzo</option>
                <option value="4">Abril</option>
                <option value="5">Mayo</option>
                <option value="6">Junio</option>
                <option value="7">Julio</option>
                <option value="8">Agosto</option>
                <option value="9">Septiembre</option>
                <option value="10">Octubre</option>
                <option value="11">Noviembre</option>
                <option value="12">Diciembre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Día
              </label>
              <select
                value={filterDia}
                onChange={(e) => setFilterDia(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los días</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((dia) => (
                  <option key={dia} value={dia.toString()}>
                    {dia}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setFilterMes("");
                  setFilterDia("");
                  setFilterAnio(currentYear.toString());
                  setFilterMateria("");
                  setFilterEstado("");
                  setSearchTerm("");
                }}
                className="w-full"
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-600 mt-4">
          Mostrando {asistenciasFiltradas.length} de {asistencias.length}{" "}
          registros {filterAnio && `del año ${filterAnio}`}
        </div>
      </Card>

      <Card>
        <Table
          columns={columns}
          data={asistenciasFiltradas}
          loading={loading}
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
        title={editingItem ? "Editar Asistencia" : "Nueva Asistencia"}
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              Guardar
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
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Estudiante
            </label>
            <select
              value={formData.estudiante_id}
              onChange={(e) =>
                setFormData({ ...formData, estudiante_id: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar estudiante</option>
              {estudiantes?.map((estudiante) => (
                <option key={estudiante.id} value={estudiante.id}>
                  {estudiante.nombre}
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

          <Input
            label="Fecha"
            type="date"
            value={formData.fecha}
            onChange={(e) =>
              setFormData({ ...formData, fecha: e.target.value })
            }
            required
          />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Estado
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="estado"
                  value="presente"
                  checked={formData.estado === "presente"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estado: e.target.value as
                        | "presente"
                        | "tarde"
                        | "ausente",
                    })
                  }
                  className="w-4 h-4 text-blue-600"
                />
                <span>Presente</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="estado"
                  value="tarde"
                  checked={formData.estado === "tarde"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estado: e.target.value as
                        | "presente"
                        | "tarde"
                        | "ausente",
                    })
                  }
                  className="w-4 h-4 text-yellow-600"
                />
                <span>Llegó Tarde</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="estado"
                  value="ausente"
                  checked={formData.estado === "ausente"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estado: e.target.value as
                        | "presente"
                        | "tarde"
                        | "ausente",
                    })
                  }
                  className="w-4 h-4 text-red-600"
                />
                <span>Ausente</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Observaciones (opcional)
            </label>
            <textarea
              value={formData.observaciones}
              onChange={(e) =>
                setFormData({ ...formData, observaciones: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              maxLength={500}
              placeholder="Agregar observaciones sobre la asistencia..."
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.observaciones.length}/500 caracteres
            </p>
          </div>
        </form>
      </Modal>
    </div>
  );
}
