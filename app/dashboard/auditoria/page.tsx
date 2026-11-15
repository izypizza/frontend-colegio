"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, Pagination } from "@/src/components/ui";
import { PermissionGuard } from "@/src/components/auth";
import { UserRole } from "@/src/types";
import { useErrorHandler } from "@/src/hooks/useErrorHandler";
import { apiClient } from "@/src/lib/api-client";

interface RegistroAuditoria {
  id: number;
  user_id: number;
  accion: string;
  entidad: string;
  entidad_id: number | null;
  descripcion: string;
  cambios_antes: Record<string, unknown> | null;
  cambios_despues: Record<string, unknown> | null;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
  user?: { id: number; name: string; email?: string; role?: string };
}

interface FiltrosDisponibles {
  entidades: string[];
  usuarios: { id: number; name: string; role?: string }[];
}

const COLOR_ACCION: Record<string, string> = {
  crear: "bg-green-100 text-green-800",
  actualizar: "bg-blue-100 text-blue-800",
  eliminar: "bg-red-100 text-red-800",
};

const ETIQUETA_ACCION: Record<string, string> = {
  crear: "Crear",
  actualizar: "Actualizar",
  eliminar: "Eliminar",
};

const CAMPOS_OCULTOS = new Set([
  "id",
  "created_at",
  "updated_at",
  "deleted_at",
]);

const formatearValor = (valor: unknown): string => {
  if (valor === null || valor === undefined || valor === "") return "—";
  if (typeof valor === "boolean") return valor ? "Sí" : "No";
  if (typeof valor === "object") return JSON.stringify(valor);

  const texto = String(valor);

  return texto.length > 60 ? `${texto.slice(0, 60)}…` : texto;
};

export default function AuditoriaPage() {
  const { error, handleError } = useErrorHandler();

  const [registros, setRegistros] = useState<RegistroAuditoria[]>([]);
  const [disponibles, setDisponibles] = useState<FiltrosDisponibles>({
    entidades: [],
    usuarios: [],
  });

  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(30);
  const [total, setTotal] = useState(0);
  const [ultimaPagina, setUltimaPagina] = useState(1);

  const [filtroEntidad, setFiltroEntidad] = useState("");
  const [filtroAccion, setFiltroAccion] = useState("");
  const [filtroUsuario, setFiltroUsuario] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const [expandido, setExpandido] = useState<number | null>(null);

  const cargarFiltros = useCallback(async () => {
    try {
      const respuesta = await apiClient.get<FiltrosDisponibles>(
        "/auditoria/filtros",
      );
      setDisponibles(respuesta);
    } catch (err) {
      handleError(err, "No se pudieron cargar los filtros de auditoría");
    }
  }, [handleError]);

  const cargarRegistros = useCallback(async () => {
    try {
      setLoading(true);

      const parametros = new URLSearchParams({
        page: String(pagina),
        per_page: String(porPagina),
      });

      if (filtroEntidad) parametros.set("entidad", filtroEntidad);
      if (filtroAccion) parametros.set("accion", filtroAccion);
      if (filtroUsuario) parametros.set("user_id", filtroUsuario);
      if (desde) parametros.set("desde", desde);
      if (hasta) parametros.set("hasta", hasta);
      if (busqueda.trim()) parametros.set("buscar", busqueda.trim());

      const respuesta = await apiClient.get<{
        data: RegistroAuditoria[];
        total: number;
        last_page: number;
      }>(`/auditoria?${parametros.toString()}`);

      setRegistros(respuesta.data);
      setTotal(respuesta.total);
      setUltimaPagina(respuesta.last_page);
    } catch (err) {
      handleError(err, "No se pudo cargar la auditoría");
    } finally {
      setLoading(false);
    }
  }, [
    pagina,
    porPagina,
    filtroEntidad,
    filtroAccion,
    filtroUsuario,
    desde,
    hasta,
    busqueda,
    handleError,
  ]);

  useEffect(() => {
    cargarFiltros();
  }, [cargarFiltros]);

  useEffect(() => {
    cargarRegistros();
  }, [cargarRegistros]);

  const limpiarFiltros = () => {
    setFiltroEntidad("");
    setFiltroAccion("");
    setFiltroUsuario("");
    setDesde("");
    setHasta("");
    setBusqueda("");
    setPagina(1);
  };

  const hayFiltrosActivos = Boolean(
    filtroEntidad || filtroAccion || filtroUsuario || desde || hasta || busqueda,
  );

  const camposCambiados = (registro: RegistroAuditoria) => {
    const antes = registro.cambios_antes ?? {};
    const despues = registro.cambios_despues ?? {};

    const claves = Array.from(
      new Set([...Object.keys(antes), ...Object.keys(despues)]),
    ).filter((clave) => !CAMPOS_OCULTOS.has(clave));

    return claves
      .map((clave) => ({
        campo: clave,
        antes: antes[clave],
        despues: despues[clave],
      }))
      .filter(
        (cambio) =>
          JSON.stringify(cambio.antes) !== JSON.stringify(cambio.despues),
      );
  };

  const totales = useMemo(
    () => ({
      registros: total,
      entidades: disponibles.entidades.length,
    }),
    [total, disponibles.entidades.length],
  );

  return (
    <PermissionGuard requiredRoles={[UserRole.ADMIN]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Auditoría del sistema
            </h1>
            <p className="text-sm text-gray-500">
              Cada operación registrada con su autor, su origen y los valores
              que cambiaron
            </p>
          </div>
          <div className="flex gap-4 text-sm text-gray-600">
            <span>
              <strong className="text-gray-900">{totales.registros}</strong>{" "}
              registros
            </span>
            <span>
              <strong className="text-gray-900">{totales.entidades}</strong>{" "}
              módulos
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Módulo
              </label>
              <select
                value={filtroEntidad}
                onChange={(evento) => {
                  setFiltroEntidad(evento.target.value);
                  setPagina(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#04ADBF]"
              >
                <option value="">Todos</option>
                {disponibles.entidades.map((entidad) => (
                  <option key={entidad} value={entidad}>
                    {entidad}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Acción
              </label>
              <select
                value={filtroAccion}
                onChange={(evento) => {
                  setFiltroAccion(evento.target.value);
                  setPagina(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#04ADBF]"
              >
                <option value="">Todas</option>
                <option value="crear">Crear</option>
                <option value="actualizar">Actualizar</option>
                <option value="eliminar">Eliminar</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Usuario
              </label>
              <select
                value={filtroUsuario}
                onChange={(evento) => {
                  setFiltroUsuario(evento.target.value);
                  setPagina(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#04ADBF]"
              >
                <option value="">Todos</option>
                {disponibles.usuarios.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Desde
              </label>
              <input
                type="date"
                value={desde}
                onChange={(evento) => {
                  setDesde(evento.target.value);
                  setPagina(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#04ADBF]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hasta
              </label>
              <input
                type="date"
                value={hasta}
                onChange={(evento) => {
                  setHasta(evento.target.value);
                  setPagina(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#04ADBF]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Buscar
              </label>
              <input
                type="text"
                value={busqueda}
                onChange={(evento) => {
                  setBusqueda(evento.target.value);
                  setPagina(1);
                }}
                placeholder="Descripción, módulo o IP"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#04ADBF]"
              />
            </div>
          </div>

          {hayFiltrosActivos && (
            <div className="mt-3">
              <Button variant="secondary" size="sm" onClick={limpiarFiltros}>
                Limpiar filtros
              </Button>
            </div>
          )}
        </Card>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin inline-block w-10 h-10 border-4 border-[#04ADBF] border-t-transparent rounded-full"></div>
            <p className="mt-4 text-gray-600">Cargando auditoría...</p>
          </div>
        ) : registros.length === 0 ? (
          <Card>
            <p className="text-center text-gray-500 py-8">
              No hay registros que coincidan con los filtros.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {registros.map((registro) => {
              const cambios = camposCambiados(registro);
              const estaExpandido = expandido === registro.id;

              return (
                <Card key={registro.id}>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          COLOR_ACCION[registro.accion] ??
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {ETIQUETA_ACCION[registro.accion] ?? registro.accion}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {registro.descripcion}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {registro.user?.name ?? "Usuario desconocido"}
                          {registro.user?.role && ` · ${registro.user.role}`}
                          {registro.ip && ` · IP ${registro.ip}`}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 whitespace-nowrap">
                      {new Date(registro.created_at).toLocaleString("es-PE")}
                    </p>
                  </div>

                  {cambios.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandido(estaExpandido ? null : registro.id)
                        }
                        className="text-xs font-medium text-[#04ADBF] hover:underline"
                      >
                        {estaExpandido ? "Ocultar detalle" : `Ver detalle (${cambios.length} campo(s))`}
                      </button>

                      {estaExpandido && (
                        <div className="mt-3 overflow-x-auto">
                          <table className="min-w-full text-xs">
                            <thead>
                              <tr className="text-left text-gray-500">
                                <th className="pr-4 py-1 font-semibold">
                                  Campo
                                </th>
                                <th className="pr-4 py-1 font-semibold">
                                  Antes
                                </th>
                                <th className="py-1 font-semibold">Después</th>
                              </tr>
                            </thead>
                            <tbody>
                              {cambios.map((cambio) => (
                                <tr
                                  key={cambio.campo}
                                  className="border-t border-gray-100"
                                >
                                  <td className="pr-4 py-1 text-gray-700 font-medium">
                                    {cambio.campo}
                                  </td>
                                  <td className="pr-4 py-1 text-red-700">
                                    {formatearValor(cambio.antes)}
                                  </td>
                                  <td className="py-1 text-green-700">
                                    {formatearValor(cambio.despues)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {registro.user_agent && (
                            <p className="mt-2 text-[11px] text-gray-400 truncate">
                              {registro.user_agent}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}

            <Pagination
              currentPage={pagina}
              lastPage={ultimaPagina}
              total={total}
              perPage={porPagina}
              onPageChange={setPagina}
              onPerPageChange={(valor) => {
                setPorPagina(valor);
                setPagina(1);
              }}
            />
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}
