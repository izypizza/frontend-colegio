"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Card,
  Input,
  Modal,
  Pagination,
  Table,
} from "@/src/components/ui";
import { PermissionGuard } from "@/src/components/auth";
import { UserRole } from "@/src/types";
import { usePermissions } from "@/src/hooks/usePermissions";
import { useErrorHandler } from "@/src/hooks/useErrorHandler";
import {
  anioEscolarService,
  matriculaService,
  seccionService,
} from "@/src/lib/services";
import type {
  AnioEscolar,
  EstadoMatricula,
  Estudiante,
  Matricula,
  Seccion,
  VacanteSeccion,
} from "@/src/types/models";

const ETIQUETA_ESTADO: Record<EstadoMatricula, string> = {
  matriculado: "Matriculado",
  retirado: "Retirado",
  trasladado: "Trasladado",
  culminado: "Culminado",
};

const COLOR_ESTADO: Record<EstadoMatricula, string> = {
  matriculado: "bg-green-100 text-green-800",
  retirado: "bg-red-100 text-red-800",
  trasladado: "bg-amber-100 text-amber-800",
  culminado: "bg-gray-100 text-gray-700",
};

const ETIQUETA_TIPO: Record<string, string> = {
  regular: "Regular",
  repite: "Repite",
  traslado_externo: "Traslado externo",
  reincorporacion: "Reincorporación",
};

const formatearFecha = (valor?: string | null) =>
  valor
    ? new Date(`${valor.split("T")[0]}T00:00:00`).toLocaleDateString("es-PE")
    : "—";

interface FormularioMatricula {
  estudiante_id: string;
  anio_escolar_id: string;
  seccion_id: string;
  tipo: string;
  observacion: string;
}

const formularioInicial: FormularioMatricula = {
  estudiante_id: "",
  anio_escolar_id: "",
  seccion_id: "",
  tipo: "regular",
  observacion: "",
};

export default function MatriculasPage() {
  const permissions = usePermissions("matriculas");
  const { error, success, handleError, handleSuccess } = useErrorHandler();

  const [anios, setAnios] = useState<AnioEscolar[]>([]);
  const [anioSeleccionado, setAnioSeleccionado] = useState<number | null>(null);
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [vacantes, setVacantes] = useState<VacanteSeccion[]>([]);
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [estudiantesDisponibles, setEstudiantesDisponibles] = useState<
    Estudiante[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroSeccion, setFiltroSeccion] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(25);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [ultimaPagina, setUltimaPagina] = useState(1);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [formulario, setFormulario] =
    useState<FormularioMatricula>(formularioInicial);
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null);

  const [traslado, setTraslado] = useState<Matricula | null>(null);
  const [seccionDestino, setSeccionDestino] = useState("");
  const [motivoTraslado, setMotivoTraslado] = useState("");

  const cargarAnios = useCallback(async () => {
    try {
      const lista = await anioEscolarService.listar();
      setAnios(lista);

      const preferido =
        lista.find((anio) => anio.estado === "abierto") ?? lista[0];

      if (preferido) {
        setAnioSeleccionado((actual) => actual ?? preferido.id);
      }
    } catch (err) {
      handleError(err, "No se pudieron cargar los años escolares");
    }
  }, [handleError]);

  const cargarSecciones = useCallback(async () => {
    try {
      const respuesta = await seccionService.getAll({ all: true });
      setSecciones(Array.isArray(respuesta) ? respuesta : respuesta.data);
    } catch (err) {
      handleError(err, "No se pudieron cargar las secciones");
    }
  }, [handleError]);

  const cargarMatriculas = useCallback(
    async (anioId: number, silencioso = false) => {
      try {
        if (!silencioso) {
          setLoading(true);
        }

        const respuesta = await matriculaService.listar({
          anio_escolar_id: anioId,
          seccion_id: filtroSeccion ? Number(filtroSeccion) : undefined,
          estado: filtroEstado || undefined,
          buscar: busqueda.trim() || undefined,
          page: pagina,
          per_page: porPagina,
        });

        setMatriculas(respuesta.data);
        setTotalRegistros(respuesta.total);
        setUltimaPagina(respuesta.last_page);
      } catch (err) {
        handleError(err, "No se pudieron cargar las matrículas");
      } finally {
        setLoading(false);
      }
    },
    [busqueda, filtroEstado, filtroSeccion, pagina, porPagina, handleError],
  );

  const cargarVacantes = useCallback(
    async (anioId: number) => {
      try {
        const respuesta = await matriculaService.vacantes(anioId);
        setVacantes(respuesta.secciones);
      } catch (err) {
        handleError(err, "No se pudieron calcular las vacantes");
      }
    },
    [handleError],
  );

  useEffect(() => {
    cargarAnios();
    cargarSecciones();
  }, [cargarAnios, cargarSecciones]);

  useEffect(() => {
    if (!anioSeleccionado) {
      return;
    }

    cargarMatriculas(anioSeleccionado);
    cargarVacantes(anioSeleccionado);
  }, [anioSeleccionado, cargarMatriculas, cargarVacantes]);

  const refrescar = async () => {
    if (!anioSeleccionado) {
      return;
    }

    await Promise.all([
      cargarMatriculas(anioSeleccionado, true),
      cargarVacantes(anioSeleccionado),
    ]);
  };

  const abrirModalMatricula = async () => {
    if (!anioSeleccionado) {
      return;
    }

    setFormulario({
      ...formularioInicial,
      anio_escolar_id: String(anioSeleccionado),
    });
    setErrorFormulario(null);
    setModalAbierto(true);

    try {
      const lista = await matriculaService.estudiantesSinMatricula(
        anioSeleccionado,
      );
      setEstudiantesDisponibles(lista);
    } catch (err) {
      handleError(err, "No se pudo cargar la lista de estudiantes");
    }
  };

  const handleSubmit = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setErrorFormulario(null);

    if (!formulario.estudiante_id || !formulario.seccion_id) {
      setErrorFormulario("Selecciona el estudiante y la sección de destino.");
      return;
    }

    setGuardando(true);

    try {
      const respuesta = await matriculaService.matricular({
        estudiante_id: Number(formulario.estudiante_id),
        anio_escolar_id: Number(formulario.anio_escolar_id),
        seccion_id: Number(formulario.seccion_id),
        tipo: formulario.tipo,
        observacion: formulario.observacion.trim() || undefined,
      });

      handleSuccess(respuesta.message);
      setModalAbierto(false);
      await refrescar();
    } catch (err) {
      handleError(err, "No se pudo registrar la matrícula");
    } finally {
      setGuardando(false);
    }
  };

  const abrirTraslado = (matricula: Matricula) => {
    setTraslado(matricula);
    setSeccionDestino("");
    setMotivoTraslado("");
    setErrorFormulario(null);
  };

  const confirmarTraslado = async () => {
    if (!traslado || !seccionDestino) {
      setErrorFormulario("Selecciona la sección de destino.");
      return;
    }

    setGuardando(true);

    try {
      const respuesta = await matriculaService.actualizar(traslado.id, {
        seccion_id: Number(seccionDestino),
        observacion: motivoTraslado.trim() || undefined,
      });

      handleSuccess(respuesta.message);
      setTraslado(null);
      await refrescar();
    } catch (err) {
      handleError(err, "No se pudo trasladar al estudiante");
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstado = async (matricula: Matricula, estado: EstadoMatricula) => {
    const mensajes: Record<string, string> = {
      retirado: "¿Registrar el retiro de este estudiante? Conserva su historial.",
      matriculado: "¿Reactivar la matrícula de este estudiante?",
      trasladado: "¿Marcar la matrícula como traslado externo?",
      culminado: "¿Marcar la matrícula como culminada?",
    };

    if (!confirm(mensajes[estado] ?? "¿Confirmar el cambio de estado?")) {
      return;
    }

    try {
      const respuesta = await matriculaService.actualizar(matricula.id, {
        estado,
      });
      handleSuccess(respuesta.message);
      await refrescar();
    } catch (err) {
      handleError(err, "No se pudo actualizar el estado de la matrícula");
    }
  };

  const vacantesPorSeccion = (seccionId: number) =>
    vacantes.find((vacante) => vacante.seccion_id === seccionId);

  const etiquetaSeccion = (seccion: Seccion) => {
    const vacante = vacantesPorSeccion(seccion.id);
    const detalle = vacante
      ? ` · ${vacante.ocupadas}/${vacante.capacidad}`
      : "";

    return `${seccion.nombre} - ${seccion.grado?.nombre ?? ""}${detalle}`;
  };

  const totalMatriculados = vacantes.reduce(
    (total, vacante) => total + vacante.ocupadas,
    0,
  );
  const totalDisponibles = vacantes.reduce(
    (total, vacante) => total + vacante.disponibles,
    0,
  );
  const capacidadTotal = vacantes.reduce(
    (total, vacante) => total + vacante.capacidad,
    0,
  );
  const porcentajeOcupacion =
    capacidadTotal > 0
      ? Math.round((totalMatriculados / capacidadTotal) * 100)
      : 0;

  const anioActual = anios.find((anio) => anio.id === anioSeleccionado);

  const columns = [
    {
      key: "estudiante",
      label: "Estudiante",
      render: (_valor: unknown, matricula: Matricula) => (
        <div>
          <p className="text-sm font-medium text-gray-900">
            {matricula.estudiante
              ? `${matricula.estudiante.apellido_paterno} ${matricula.estudiante.apellido_materno}, ${matricula.estudiante.nombres}`
              : "—"}
          </p>
          <p className="text-xs text-gray-500">
            DNI {matricula.estudiante?.dni ?? "—"}
          </p>
        </div>
      ),
    },
    {
      key: "seccion",
      label: "Grado y Sección",
      render: (_valor: unknown, matricula: Matricula) => (
        <span className="text-sm text-gray-700">
          {matricula.seccion?.grado?.nombre ?? ""}{" "}
          {matricula.seccion?.nombre ? `"${matricula.seccion.nombre}"` : "—"}
        </span>
      ),
    },
    {
      key: "tipo",
      label: "Tipo",
      render: (valor: unknown) => (
        <span className="text-sm text-gray-700">
          {ETIQUETA_TIPO[String(valor)] ?? String(valor)}
        </span>
      ),
    },
    {
      key: "estado",
      label: "Estado",
      render: (valor: unknown) => {
        const estado = valor as EstadoMatricula;

        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${COLOR_ESTADO[estado] ?? "bg-gray-100 text-gray-700"}`}
          >
            {ETIQUETA_ESTADO[estado] ?? estado}
          </span>
        );
      },
    },
    {
      key: "fecha_matricula",
      label: "Matriculado el",
      render: (valor: unknown) => (
        <span className="text-sm text-gray-600">
          {formatearFecha(valor as string)}
        </span>
      ),
    },
  ];

  return (
    <PermissionGuard requiredRoles={[UserRole.ADMIN, UserRole.AUXILIAR]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Matrículas</h1>
            <p className="text-sm text-gray-500">
              Registra y controla la matrícula de cada estudiante por año
              escolar
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={anioSeleccionado ?? ""}
              onChange={(evento) => {
                setAnioSeleccionado(Number(evento.target.value));
                setPagina(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#04ADBF]"
            >
              {anios.map((anio) => (
                <option key={anio.id} value={anio.id}>
                  {anio.anio} · {anio.estado}
                </option>
              ))}
            </select>
            {permissions.canCreate && (
              <Button variant="primary" onClick={abrirModalMatricula}>
                + Matricular alumno
              </Button>
            )}
          </div>
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
              Matriculados
            </p>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
              {totalMatriculados}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {anioActual ? `Año ${anioActual.anio}` : "Sin año"}
            </p>
          </Card>
          <Card>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Vacantes libres
            </p>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-[#04ADBF]">
              {totalDisponibles}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {vacantes.length} secciones
            </p>
          </Card>
          <Card>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Ocupación
            </p>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
              {porcentajeOcupacion}%
            </p>
            <p className="mt-1 text-xs text-gray-500">Ocupación de aulas</p>
          </Card>
          <Card>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Registros
            </p>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
              {totalRegistros}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {anioActual?.estado === "abierto"
                ? "Año abierto"
                : "Año no abierto"}
            </p>
          </Card>
        </div>

        <Card>
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="flex-1">
              <Input
                label="Buscar"
                placeholder="Nombre, apellidos o DNI"
                value={busqueda}
                onChange={(evento) => {
                  setBusqueda(evento.target.value);
                  setPagina(1);
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sección
              </label>
              <select
                value={filtroSeccion}
                onChange={(evento) => {
                  setFiltroSeccion(evento.target.value);
                  setPagina(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#04ADBF]"
              >
                <option value="">Todas</option>
                {secciones.map((seccion) => (
                  <option key={seccion.id} value={seccion.id}>
                    {seccion.nombre} - {seccion.grado?.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={filtroEstado}
                onChange={(evento) => {
                  setFiltroEstado(evento.target.value);
                  setPagina(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#04ADBF]"
              >
                <option value="">Todos</option>
                <option value="matriculado">Matriculado</option>
                <option value="retirado">Retirado</option>
                <option value="trasladado">Trasladado</option>
                <option value="culminado">Culminado</option>
              </select>
            </div>
          </div>

          <Table
            columns={columns}
            data={matriculas}
            loading={loading}
            extraActions={
              permissions.canEdit
                ? (matricula: Matricula) => (
                    <div className="flex flex-wrap gap-1">
                      {matricula.estado === "matriculado" && (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => abrirTraslado(matricula)}
                          >
                            Trasladar
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => cambiarEstado(matricula, "retirado")}
                          >
                            Retirar
                          </Button>
                        </>
                      )}
                      {(matricula.estado === "retirado" ||
                        matricula.estado === "trasladado") && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() =>
                            cambiarEstado(matricula, "matriculado")
                          }
                        >
                          Reactivar
                        </Button>
                      )}
                      {matricula.estado === "matriculado" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            cambiarEstado(matricula, "culminado")
                          }
                        >
                          Culminar
                        </Button>
                      )}
                    </div>
                  )
                : undefined
            }
          />

          {totalRegistros > 0 && (
            <div className="mt-4">
              <Pagination
                currentPage={pagina}
                lastPage={ultimaPagina}
                total={totalRegistros}
                perPage={porPagina}
                onPageChange={setPagina}
                onPerPageChange={(valor) => {
                  setPorPagina(valor);
                  setPagina(1);
                }}
              />
            </div>
          )}
        </Card>

        <Modal
          isOpen={modalAbierto}
          onClose={() => setModalAbierto(false)}
          title="Matricular alumno"
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorFormulario && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {errorFormulario}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Estudiante sin matrícula
              </label>
              <select
                value={formulario.estudiante_id}
                onChange={(evento) =>
                  setFormulario({
                    ...formulario,
                    estudiante_id: evento.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#04ADBF]"
                required
              >
                <option value="">Seleccionar estudiante</option>
                {estudiantesDisponibles.map((estudiante) => (
                  <option key={estudiante.id} value={estudiante.id}>
                    {estudiante.apellido_paterno} {estudiante.apellido_materno},{" "}
                    {estudiante.nombres} · DNI {estudiante.dni}
                  </option>
                ))}
              </select>
              {estudiantesDisponibles.length === 0 && (
                <p className="mt-2 text-xs text-gray-500">
                  Todos los estudiantes ya tienen matrícula en este año.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sección de destino
              </label>
              <select
                value={formulario.seccion_id}
                onChange={(evento) =>
                  setFormulario({
                    ...formulario,
                    seccion_id: evento.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#04ADBF]"
                required
              >
                <option value="">Seleccionar sección</option>
                {secciones.map((seccion) => (
                  <option key={seccion.id} value={seccion.id}>
                    {etiquetaSeccion(seccion)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tipo de matrícula
              </label>
              <select
                value={formulario.tipo}
                onChange={(evento) =>
                  setFormulario({ ...formulario, tipo: evento.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#04ADBF]"
              >
                <option value="regular">Regular</option>
                <option value="repite">Repite el grado</option>
                <option value="traslado_externo">Traslado externo</option>
                <option value="reincorporacion">Reincorporación</option>
              </select>
            </div>

            <Input
              label="Observación (opcional)"
              value={formulario.observacion}
              onChange={(evento) =>
                setFormulario({ ...formulario, observacion: evento.target.value })
              }
              placeholder="Matrícula condicional, documentación pendiente..."
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setModalAbierto(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={guardando}>
                {guardando ? "Guardando..." : "Registrar matrícula"}
              </Button>
            </div>
          </form>
        </Modal>

        <Modal
          isOpen={traslado !== null}
          onClose={() => setTraslado(null)}
          title="Trasladar de sección"
        >
          <div className="space-y-4">
            {errorFormulario && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {errorFormulario}
              </div>
            )}

            <p className="text-sm text-gray-600">
              Estudiante:{" "}
              <span className="font-medium text-gray-900">
                {traslado?.estudiante
                  ? `${traslado.estudiante.apellido_paterno} ${traslado.estudiante.apellido_materno}, ${traslado.estudiante.nombres}`
                  : "—"}
              </span>
            </p>
            <p className="text-sm text-gray-600">
              Sección actual:{" "}
              <span className="font-medium text-gray-900">
                {traslado?.seccion?.grado?.nombre ?? ""}{" "}
                {traslado?.seccion ? `"${traslado.seccion.nombre}"` : "—"}
              </span>
            </p>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nueva sección
              </label>
              <select
                value={seccionDestino}
                onChange={(evento) => setSeccionDestino(evento.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#04ADBF]"
              >
                <option value="">Seleccionar sección</option>
                {secciones
                  .filter((seccion) => seccion.id !== traslado?.seccion_id)
                  .map((seccion) => (
                    <option key={seccion.id} value={seccion.id}>
                      {etiquetaSeccion(seccion)}
                    </option>
                  ))}
              </select>
            </div>

            <Input
              label="Motivo (opcional)"
              value={motivoTraslado}
              onChange={(evento) => setMotivoTraslado(evento.target.value)}
              placeholder="Reorganización de aulas, solicitud del apoderado..."
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setTraslado(null)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={guardando}
                onClick={confirmarTraslado}
              >
                {guardando ? "Trasladando..." : "Confirmar traslado"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </PermissionGuard>
  );
}
