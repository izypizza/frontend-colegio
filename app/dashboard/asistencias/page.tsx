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
  asistenciaJustificacionService,
  asistenciaService,
  estudianteService,
  gradoService,
  materiaService,
  seccionService,
} from "@/src/lib/services";
import {
  Asistencia,
  Estudiante,
  Grado,
  Materia,
  Seccion,
} from "@/src/types/models";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/src/features/auth";
import { useErrorHandler } from "@/src/hooks/useErrorHandler";
import { useModalState } from "@/src/hooks/useModalState";
import { usePagination } from "@/src/hooks/usePagination";
import { PermissionGuard } from "@/src/components/auth";
import { UserRole } from "@/src/types";

const ETIQUETA_ESTADO: Record<string, string> = {
  presente: "Presente",
  tarde: "Llegó tarde",
  ausente: "Ausente",
};

const ESTILO_ESTADO: Record<string, string> = {
  presente: "bg-green-100 text-green-800",
  tarde: "bg-yellow-100 text-yellow-800",
  ausente: "bg-red-100 text-red-800",
};

const nombreDeEstudiante = (estudiante?: Estudiante | null) => {
  if (!estudiante) return "—";

  if (estudiante.nombre_completo) return estudiante.nombre_completo;

  const apellidos = `${estudiante.apellido_paterno || ""} ${
    estudiante.apellido_materno || ""
  }`.trim();

  return `${apellidos}, ${estudiante.nombres || ""}`.trim();
};

const formatearFecha = (valor?: string | null) => {
  if (!valor) return "—";

  const coincidencia = String(valor).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!coincidencia) return String(valor);

  return `${coincidencia[3]}/${coincidencia[2]}/${coincidencia[1]}`;
};

const listaDe = <T,>(respuesta: any): T[] =>
  Array.isArray(respuesta) ? respuesta : respuesta?.data || [];

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
  } = usePagination(50);

  const esAdministrador = user?.role === "admin";
  const puedeJustificar = user?.role === "admin" || user?.role === "auxiliar";

  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [grados, setGrados] = useState<Grado[]>([]);
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);

  const [filtros, setFiltros] = useState({
    gradoId: "",
    seccionId: "",
    materiaId: "",
    estado: "",
    fecha: "",
  });
  const [busqueda, setBusqueda] = useState("");
  const [busquedaAplicada, setBusquedaAplicada] = useState("");

  const [editingItem, setEditingItem] = useState<Asistencia | null>(null);
  const [formData, setFormData] = useState({
    estudiante_id: "",
    materia_id: "",
    fecha: "",
    estado: "presente" as "presente" | "tarde" | "ausente",
    observaciones: "",
  });
  const [seccionModal, setSeccionModal] = useState("");
  const [estudiantesSeccion, setEstudiantesSeccion] = useState<Estudiante[]>(
    [],
  );
  const [cargandoEstudiantes, setCargandoEstudiantes] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [asistenciaAJustificar, setAsistenciaAJustificar] =
    useState<Asistencia | null>(null);
  const [motivoJustificacion, setMotivoJustificacion] = useState("");
  const [errorJustificacion, setErrorJustificacion] = useState<string | null>(
    null,
  );
  const [guardandoJustificacion, setGuardandoJustificacion] = useState(false);

  // Catálogos: grados, secciones y cursos se cargan una sola vez.
  useEffect(() => {
    if (!user) return;

    const cargarCatalogos = async () => {
      try {
        const [gradosData, seccionesData, materiasData] = await Promise.all([
          gradoService.getAll({ all: true }),
          seccionService.getAll({
            all: true,
            filtros: { solo_conteo: true },
          }),
          materiaService.getAll({ all: true }),
        ]);

        setGrados(listaDe<Grado>(gradosData));
        setSecciones(listaDe<Seccion>(seccionesData));
        setMaterias(listaDe<Materia>(materiasData));
      } catch (err) {
        handleError(err, "No se pudieron cargar los filtros");
      }
    };

    cargarCatalogos();
  }, [user]);

  // Evita consultar al servidor en cada tecla.
  useEffect(() => {
    const temporizador = setTimeout(() => {
      setBusquedaAplicada(busqueda.trim());
      setCurrentPage(1);
    }, 350);

    return () => clearTimeout(temporizador);
  }, [busqueda]);

  const filtrosApi = useMemo(() => {
    const resultado: Record<string, string | number | boolean> = {};

    if (filtros.seccionId) resultado.seccion_id = filtros.seccionId;
    if (filtros.materiaId) resultado.materia_id = filtros.materiaId;
    if (filtros.estado) resultado.estado = filtros.estado;
    if (busquedaAplicada) resultado.buscar = busquedaAplicada;

    if (filtros.fecha) {
      resultado.fecha_inicio = filtros.fecha;
      resultado.fecha_fin = filtros.fecha;
    }

    return resultado;
  }, [
    filtros.seccionId,
    filtros.materiaId,
    filtros.estado,
    filtros.fecha,
    busquedaAplicada,
  ]);

  const cargarAsistencias = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const respuesta = await asistenciaService.getAll({
        page: currentPage,
        per_page: perPage,
        filtros: filtrosApi,
      });

      const lista = Array.isArray(respuesta) ? respuesta : respuesta.data;
      setAsistencias(lista);

      setPaginationData(
        Array.isArray(respuesta)
          ? { total: respuesta.length, lastPage: 1 }
          : {
              total: respuesta.total ?? lista.length,
              lastPage: respuesta.last_page ?? 1,
            },
      );
    } catch (err) {
      handleError(err, "Error al cargar las asistencias");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAsistencias();
  }, [user, currentPage, perPage, filtrosApi]);

  const opcionesGrado = useMemo(
    () =>
      grados.map((grado) => ({
        valor: grado.id,
        etiqueta: grado.nombre,
      })),
    [grados],
  );

  const seccionesDelGrado = useMemo(
    () =>
      filtros.gradoId
        ? secciones.filter(
            (seccion) => String(seccion.grado_id) === filtros.gradoId,
          )
        : secciones,
    [secciones, filtros.gradoId],
  );

  const opcionesSeccion = useMemo(
    () =>
      seccionesDelGrado.map((seccion) => ({
        valor: seccion.id,
        etiqueta: `${seccion.grado?.nombre ?? ""} ${seccion.nombre}`.trim(),
        detalle: seccion.estudiantes_count
          ? `${seccion.estudiantes_count} estudiante(s)`
          : null,
      })),
    [seccionesDelGrado],
  );

  const opcionesSeccionModal = useMemo(
    () =>
      secciones.map((seccion) => ({
        valor: seccion.id,
        etiqueta: `${seccion.grado?.nombre ?? ""} ${seccion.nombre}`.trim(),
      })),
    [secciones],
  );

  const opcionesMateria = useMemo(
    () =>
      materias.map((materia) => ({
        valor: materia.id,
        etiqueta: materia.nombre,
      })),
    [materias],
  );

  const opcionesEstado = [
    { valor: "presente", etiqueta: "Presente" },
    { valor: "tarde", etiqueta: "Llegó tarde" },
    { valor: "ausente", etiqueta: "Ausente" },
  ];

  // Los estudiantes se piden solo para la sección que se está trabajando.
  useEffect(() => {
    if (!isModalOpen || editingItem || !seccionModal) {
      setEstudiantesSeccion([]);
      return;
    }

    const cargarEstudiantes = async () => {
      try {
        setCargandoEstudiantes(true);
        const respuesta = await estudianteService.getAll({
          all: true,
          filtros: { seccion_id: seccionModal },
        });
        setEstudiantesSeccion(listaDe<Estudiante>(respuesta));
      } catch (err) {
        handleError(err, "No se pudieron cargar los estudiantes de la sección");
      } finally {
        setCargandoEstudiantes(false);
      }
    };

    cargarEstudiantes();
  }, [isModalOpen, seccionModal, editingItem]);

  const opcionesEstudiante = useMemo(
    () =>
      estudiantesSeccion.map((estudiante) => ({
        valor: estudiante.id,
        etiqueta: nombreDeEstudiante(estudiante),
        detalle: estudiante.dni ? `DNI ${estudiante.dni}` : null,
      })),
    [estudiantesSeccion],
  );

  const limpiarFiltros = () => {
    setFiltros({
      gradoId: "",
      seccionId: "",
      materiaId: "",
      estado: "",
      fecha: "",
    });
    setBusqueda("");
    setBusquedaAplicada("");
    setCurrentPage(1);
  };

  const handleExportExcel = async () => {
    try {
      setLoading(true);
      const respuesta = await asistenciaService.getAll({
        all: true,
        filtros: filtrosApi,
      });
      const registros = listaDe<Asistencia>(respuesta);

      if (registros.length === 0) {
        setError("No hay datos para exportar con los filtros actuales");
        return;
      }

      const filas = registros.map((asistencia) => ({
        Estudiante: nombreDeEstudiante(asistencia.estudiante),
        DNI: asistencia.estudiante?.dni || "",
        Curso: asistencia.materia?.nombre || "",
        Fecha: formatearFecha(asistencia.fecha),
        Estado: ETIQUETA_ESTADO[asistencia.estado] || asistencia.estado,
        Justificada: asistencia.justificada ? "Sí" : "No",
        Observaciones: asistencia.observaciones || "",
      }));

      const encabezados = Object.keys(filas[0]);
      const contenido = [
        encabezados.join(","),
        ...filas.map((fila) =>
          encabezados
            .map((encabezado) => {
              const valor = fila[encabezado as keyof typeof fila] || "";
              return `"${String(valor).replace(/"/g, '""')}"`;
            })
            .join(","),
        ),
      ].join("\r\n");

      const blob = new Blob(["\uFEFF" + contenido], {
        type: "text/csv;charset=utf-8;",
      });
      const enlace = document.createElement("a");
      const url = URL.createObjectURL(blob);
      enlace.href = url;
      enlace.download = `asistencias_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);
      URL.revokeObjectURL(url);

      setSuccess(`Archivo exportado con ${registros.length} registro(s).`);
    } catch (err) {
      handleError(err, "Error al exportar el archivo");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({
      estudiante_id: "",
      materia_id: filtros.materiaId || "",
      fecha: new Date().toISOString().split("T")[0],
      estado: "presente",
      observaciones: "",
    });
    setSeccionModal(filtros.seccionId || "");
    openModal();
  };

  const handleEdit = (asistencia: Asistencia) => {
    setEditingItem(asistencia);
    setFormData({
      estudiante_id: String(asistencia.estudiante_id),
      materia_id: String(asistencia.materia_id),
      fecha: String(asistencia.fecha).split("T")[0],
      estado: asistencia.estado || "presente",
      observaciones: asistencia.observaciones || "",
    });
    setSeccionModal("");
    openModal();
  };

  const handleDelete = async (asistencia: Asistencia) => {
    if (!confirm("¿Eliminar este registro de asistencia?")) return;

    try {
      await asistenciaService.delete(asistencia.id);
      setSuccess("Asistencia eliminada correctamente");
      cargarAsistencias();
    } catch (err) {
      handleError(err, "Error al eliminar la asistencia");
    }
  };

  const handleSubmit = async (evento?: React.FormEvent) => {
    evento?.preventDefault();

    if (guardando) return;

    try {
      setGuardando(true);
      setError(null);

      if (editingItem) {
        // Solo se corrigen el estado y las observaciones: mover al estudiante,
        // el curso o la fecha crearía registros duplicados.
        await asistenciaService.update(editingItem.id, {
          estado: formData.estado,
          observaciones: formData.observaciones.trim(),
        });
        setSuccess("Asistencia actualizada correctamente");
      } else {
        if (
          !formData.estudiante_id ||
          !formData.materia_id ||
          !formData.fecha
        ) {
          setError("Completa sección, estudiante, curso y fecha.");
          return;
        }

        await asistenciaService.create({
          estudiante_id: parseInt(formData.estudiante_id),
          materia_id: parseInt(formData.materia_id),
          fecha: formData.fecha,
          estado: formData.estado,
          observaciones: formData.observaciones || undefined,
        });
        setSuccess("Asistencia registrada correctamente");
      }

      closeModal();
      setEditingItem(null);
      setSeccionModal("");
      setFormData({
        estudiante_id: "",
        materia_id: "",
        fecha: "",
        estado: "presente",
        observaciones: "",
      });
      cargarAsistencias();
    } catch (err: any) {
      handleError(err, "Error al guardar la asistencia");
    } finally {
      setGuardando(false);
    }
  };

  const abrirJustificacion = (asistencia: Asistencia) => {
    setAsistenciaAJustificar(asistencia);
    setMotivoJustificacion(asistencia.motivo_justificacion ?? "");
    setErrorJustificacion(null);
  };

  const cerrarJustificacion = () => {
    setAsistenciaAJustificar(null);
    setMotivoJustificacion("");
    setErrorJustificacion(null);
  };

  const guardarJustificacion = async (justificada: boolean) => {
    if (!asistenciaAJustificar) return;

    if (justificada && motivoJustificacion.trim().length === 0) {
      setErrorJustificacion("Escribe el motivo de la justificación.");
      return;
    }

    try {
      setGuardandoJustificacion(true);
      setErrorJustificacion(null);

      await asistenciaJustificacionService.justificar(
        asistenciaAJustificar.id,
        justificada,
        motivoJustificacion.trim(),
      );

      setSuccess(
        justificada
          ? "La falta quedó registrada como justificada."
          : "Se retiró la justificación de la falta.",
      );
      cerrarJustificacion();
      cargarAsistencias();
    } catch (err: any) {
      setErrorJustificacion(
        err?.message || "No se pudo guardar la justificación.",
      );
    } finally {
      setGuardandoJustificacion(false);
    }
  };

  const columns = [
    {
      key: "estudiante",
      label: "Estudiante",
      render: (_valor: unknown, asistencia: Asistencia) => (
        <div>
          <div className="font-medium">
            {nombreDeEstudiante(asistencia.estudiante)}
          </div>
          {asistencia.estudiante?.dni && (
            <div className="text-sm text-gray-500">
              DNI: {asistencia.estudiante.dni}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "materia",
      label: "Curso",
      render: (_valor: unknown, asistencia: Asistencia) =>
        asistencia.materia?.nombre || "—",
    },
    {
      key: "fecha",
      label: "Fecha",
      render: (_valor: unknown, asistencia: Asistencia) =>
        formatearFecha(asistencia.fecha),
    },
    {
      key: "estado",
      label: "Estado",
      render: (_valor: unknown, asistencia: Asistencia) => {
        const estado = asistencia.estado || "presente";

        return (
          <div className="flex flex-col gap-1">
            <span
              className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                ESTILO_ESTADO[estado] || "bg-gray-100 text-gray-700"
              }`}
            >
              {ETIQUETA_ESTADO[estado] || estado}
            </span>
            {asistencia.justificada && (
              <span
                className="w-fit rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800"
                title={asistencia.motivo_justificacion ?? undefined}
              >
                Justificada
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "acciones",
      label: "Acciones",
      render: (_valor: unknown, asistencia: Asistencia) => (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleEdit(asistencia)}
          >
            Editar
          </Button>

          {puedeJustificar && asistencia.estado !== "presente" && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => abrirJustificacion(asistencia)}
            >
              {asistencia.justificada ? "Justificación" : "Justificar"}
            </Button>
          )}

          {esAdministrador && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDelete(asistencia)}
            >
              Eliminar
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (!user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#04ADBF]" />
      </div>
    );
  }

  return (
    <PermissionGuard
      requiredRoles={[UserRole.ADMIN, UserRole.AUXILIAR, UserRole.DOCENTE]}
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
            <h1 className="text-2xl font-bold text-gray-800">Asistencias</h1>
            <p className="text-gray-600 mt-1">
              Elige grado, sección y fecha para acotar la lista. Los filtros se
              aplican sobre todos los registros, no solo sobre la página
              visible.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={handleExportExcel}>
              Exportar Excel
            </Button>
            <Button variant="primary" onClick={handleCreate}>
              + Registrar asistencia
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

        <Card>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SelectBuscable
              label="Grado"
              opciones={opcionesGrado}
              valor={filtros.gradoId}
              onChange={(valor) =>
                setFiltros((previo) => ({
                  ...previo,
                  gradoId: valor,
                  seccionId: "",
                }))
              }
              vacio="Todos los grados"
              placeholder="Buscar grado"
            />

            <SelectBuscable
              label="Sección"
              opciones={opcionesSeccion}
              valor={filtros.seccionId}
              onChange={(valor) => {
                setFiltros((previo) => ({ ...previo, seccionId: valor }));
                setCurrentPage(1);
              }}
              vacio="Todas las secciones"
              placeholder="Buscar sección"
            />

            <SelectBuscable
              label="Curso"
              opciones={opcionesMateria}
              valor={filtros.materiaId}
              onChange={(valor) => {
                setFiltros((previo) => ({ ...previo, materiaId: valor }));
                setCurrentPage(1);
              }}
              vacio="Todos los cursos"
              placeholder="Buscar curso"
            />

            <SelectBuscable
              label="Estado"
              opciones={opcionesEstado}
              valor={filtros.estado}
              onChange={(valor) => {
                setFiltros((previo) => ({ ...previo, estado: valor }));
                setCurrentPage(1);
              }}
              vacio="Todos los estados"
              placeholder="Buscar estado"
            />
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4 md:flex-row md:items-end">
            <div className="flex-1">
              <Input
                label="Fecha"
                type="date"
                value={filtros.fecha}
                onChange={(evento) => {
                  setFiltros((previo) => ({
                    ...previo,
                    fecha: evento.target.value,
                  }));
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="flex-1">
              <Input
                label="Buscar estudiante"
                placeholder="Nombre o DNI"
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
              />
            </div>

            <Button variant="secondary" onClick={limpiarFiltros}>
              Limpiar filtros
            </Button>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            {paginationData.total} registro(s) con los filtros actuales
          </p>
        </Card>

        <Card>
          <Table
            columns={columns}
            data={asistencias}
            loading={loading}
            filtrable={false}
            sortable={false}
          />
        </Card>

        <Pagination
          currentPage={currentPage}
          lastPage={paginationData.lastPage}
          total={paginationData.total}
          perPage={perPage}
          onPageChange={(pagina) => {
            setCurrentPage(pagina);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onPerPageChange={(nuevo) => {
            setPerPage(nuevo);
            setCurrentPage(1);
          }}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            closeModal();
            setError(null);
            setEditingItem(null);
          }}
          title={editingItem ? "Editar asistencia" : "Registrar asistencia"}
          footer={
            <>
              <Button variant="secondary" onClick={closeModal}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={guardando}
              >
                {guardando ? "Guardando..." : "Guardar"}
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
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
                <p className="font-semibold text-gray-900">
                  {nombreDeEstudiante(editingItem.estudiante)}
                </p>
                <p className="text-gray-600">
                  {editingItem.materia?.nombre || "Curso"} ·{" "}
                  {formatearFecha(editingItem.fecha)}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  El estudiante, el curso y la fecha no se modifican desde aquí.
                  Si están mal, elimina el registro y regístralo de nuevo.
                </p>
              </div>
            ) : (
              <>
                <SelectBuscable
                  label="Sección"
                  opciones={opcionesSeccionModal}
                  valor={seccionModal}
                  onChange={(valor) => {
                    setSeccionModal(valor);
                    setFormData((previo) => ({
                      ...previo,
                      estudiante_id: "",
                    }));
                  }}
                  vacio="Seleccionar sección"
                  placeholder="Buscar sección"
                  required
                />

                <SelectBuscable
                  label="Estudiante"
                  opciones={opcionesEstudiante}
                  valor={formData.estudiante_id}
                  onChange={(valor) =>
                    setFormData((previo) => ({
                      ...previo,
                      estudiante_id: valor,
                    }))
                  }
                  vacio={
                    !seccionModal
                      ? "Primero elige una sección"
                      : cargandoEstudiantes
                        ? "Cargando estudiantes..."
                        : "Seleccionar estudiante"
                  }
                  placeholder="Buscar estudiante"
                  disabled={!seccionModal || cargandoEstudiantes}
                  required
                />

                <SelectBuscable
                  label="Curso"
                  opciones={opcionesMateria}
                  valor={formData.materia_id}
                  onChange={(valor) =>
                    setFormData((previo) => ({ ...previo, materia_id: valor }))
                  }
                  vacio="Seleccionar curso"
                  placeholder="Buscar curso"
                  required
                />

                <Input
                  label="Fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={(evento) =>
                    setFormData((previo) => ({
                      ...previo,
                      fecha: evento.target.value,
                    }))
                  }
                  required
                />
              </>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Estado
              </label>
              <div className="flex flex-wrap gap-4">
                {(["presente", "tarde", "ausente"] as const).map((valor) => (
                  <label
                    key={valor}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <input
                      type="radio"
                      name="estado"
                      value={valor}
                      checked={formData.estado === valor}
                      onChange={() =>
                        setFormData((previo) => ({ ...previo, estado: valor }))
                      }
                      className="h-4 w-4"
                    />
                    <span>{ETIQUETA_ESTADO[valor]}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Observaciones (opcional)
              </label>
              <textarea
                value={formData.observaciones}
                onChange={(evento) =>
                  setFormData((previo) => ({
                    ...previo,
                    observaciones: evento.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                maxLength={500}
                placeholder="Agregar observaciones sobre la asistencia..."
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.observaciones.length}/500 caracteres
              </p>
            </div>
          </form>
        </Modal>

        <Modal
          isOpen={asistenciaAJustificar !== null}
          onClose={cerrarJustificacion}
          title="Justificar falta o tardanza"
          footer={
            <>
              <Button variant="secondary" onClick={cerrarJustificacion}>
                Cancelar
              </Button>
              {asistenciaAJustificar?.justificada && (
                <Button
                  variant="danger"
                  onClick={() => guardarJustificacion(false)}
                  disabled={guardandoJustificacion}
                >
                  Retirar justificación
                </Button>
              )}
              <Button
                variant="primary"
                onClick={() => guardarJustificacion(true)}
                disabled={guardandoJustificacion}
              >
                {guardandoJustificacion
                  ? "Guardando..."
                  : "Guardar justificación"}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            {errorJustificacion && (
              <Alert
                type="error"
                message={errorJustificacion}
                onClose={() => setErrorJustificacion(null)}
              />
            )}

            {asistenciaAJustificar && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
                <p className="font-semibold text-gray-800">
                  {nombreDeEstudiante(asistenciaAJustificar.estudiante)}
                </p>
                <p className="text-gray-600">
                  {asistenciaAJustificar.materia?.nombre || "Curso"} ·{" "}
                  {formatearFecha(asistenciaAJustificar.fecha)}
                </p>
                <p className="mt-1 text-gray-600">
                  Estado registrado:{" "}
                  <span className="font-semibold">
                    {ETIQUETA_ESTADO[asistenciaAJustificar.estado] ||
                      asistenciaAJustificar.estado}
                  </span>
                </p>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Motivo de la justificación
              </label>
              <textarea
                value={motivoJustificacion}
                onChange={(evento) =>
                  setMotivoJustificacion(evento.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#04ADBF]"
                rows={3}
                maxLength={500}
                placeholder="Ejemplo: cita médica en el Hospital Regional, permiso por trámite en la UGEL..."
              />
              <p className="mt-1 text-sm text-gray-500">
                {motivoJustificacion.length}/500 caracteres
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Queda registrado quién justificó y en qué momento.
              </p>
            </div>
          </div>
        </Modal>
      </div>
    </PermissionGuard>
  );
}
