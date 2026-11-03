"use client";

import { useState, useEffect } from "react";
import { eleccionService, votoService } from "@/src/lib/services";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Alert } from "@/src/components/ui/Alert";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { useErrorHandler } from "@/src/hooks/useErrorHandler";

interface Partido {
  id: number;
  nombre?: string;
}

interface Candidato {
  id: number;
  eleccion_id: number;
  nombre: string;
  partido_id?: number;
  partido?: Partido;
  votos_count?: number;
}

interface Eleccion {
  id: number;
  titulo: string;
  fecha: string;
  estado?: string;
  fecha_inicio?: string;
  fecha_cierre?: string;
  resultados_publicados?: boolean;
  candidatos?: Candidato[];
  votos_count?: number;
}

interface FilaResultado {
  id: number;
  nombre: string;
  partido: string | null;
  votos: number;
  porcentaje: number;
}

interface ResumenResultados {
  titulo: string;
  totalVotos: number;
  filas: FilaResultado[];
}

type Vista = "lista" | "detalle" | "resultados";
type EstadoVisual = "activa" | "proxima" | "cerrada" | "publicada";

const formatoFecha = (valor?: string) => {
  if (!valor) return "Sin fecha";
  return new Date(valor).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatoHora = (valor?: string) => {
  if (!valor) return "";
  return new Date(valor).toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function EleccionesPage() {
  const { user } = useAuth();
  const { error, success, setError, setSuccess, handleError } =
    useErrorHandler();

  const [vista, setVista] = useState<Vista>("lista");
  const [elecciones, setElecciones] = useState<Eleccion[]>([]);
  const [eleccionSeleccionada, setEleccionSeleccionada] =
    useState<Eleccion | null>(null);
  const [resultados, setResultados] = useState<ResumenResultados | null>(null);
  const [yaVote, setYaVote] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [ahora, setAhora] = useState(() => Date.now());

  useEffect(() => {
    const temporizador = window.setInterval(() => setAhora(Date.now()), 1000);
    return () => window.clearInterval(temporizador);
  }, []);

  const esEstudiante = user?.role === "estudiante";

  const votacionAbierta = (eleccion: Eleccion) =>
    eleccion.estado === "activa" &&
    !!eleccion.fecha_inicio &&
    !!eleccion.fecha_cierre &&
    ahora >= new Date(eleccion.fecha_inicio).getTime() &&
    ahora < new Date(eleccion.fecha_cierre).getTime();

  const estadoVisual = (eleccion: Eleccion): EstadoVisual => {
    if (eleccion.estado === "cerrada") {
      return eleccion.resultados_publicados ? "publicada" : "cerrada";
    }
    return votacionAbierta(eleccion) ? "activa" : "proxima";
  };

  const etiquetaEstado = (estado: EstadoVisual) => {
    if (estado === "activa") return "En votación";
    if (estado === "proxima") return "Próximamente";
    if (estado === "publicada") return "Resultados publicados";
    return "Cerrada";
  };

  const clasesEstado = (estado: EstadoVisual) => {
    if (estado === "activa") return "bg-green-100 text-green-800";
    if (estado === "proxima") return "bg-amber-100 text-amber-800";
    if (estado === "publicada") return "bg-sky-100 text-sky-800";
    return "bg-gray-100 text-gray-700";
  };

  useEffect(() => {
    loadElecciones();
  }, []);

  const loadElecciones = async () => {
    try {
      setLoading(true);
      const data = await eleccionService.getAll();
      setElecciones(Array.isArray(data) ? data : []);
    } catch (err: any) {
      handleError(err, "No se pudo cargar la lista de elecciones");
    } finally {
      setLoading(false);
    }
  };

  const volverAlListado = () => {
    setVista("lista");
    setEleccionSeleccionada(null);
    setResultados(null);
    setYaVote(false);
    setError(null);
    setSuccess(null);
    loadElecciones();
  };

  const handleVerEleccion = async (eleccion: Eleccion) => {
    try {
      setCargandoDetalle(true);
      setError(null);
      setSuccess(null);

      const detalleEleccion = await eleccionService.getById(eleccion.id);
      setEleccionSeleccionada(detalleEleccion);

      if (esEstudiante) {
        try {
          const estadoVoto = await eleccionService.yaVote(eleccion.id);
          setYaVote(estadoVoto?.ya_voto || false);
        } catch {
          setYaVote(false);
        }
      } else {
        setYaVote(false);
      }

      setVista("detalle");
    } catch (err: any) {
      handleError(
        err,
        "No se pudo abrir la elección. Vuelve a intentarlo en un momento.",
      );
    } finally {
      setCargandoDetalle(false);
    }
  };

  const handleVotar = async (candidato_id: number) => {
    if (!eleccionSeleccionada || !votacionAbierta(eleccionSeleccionada)) {
      setError("La votación no está abierta en este momento.");
      return;
    }

    if (
      !confirm(
        "¿Confirmas tu voto? Una vez registrado no se puede modificar ni anular.",
      )
    ) {
      return;
    }

    try {
      await votoService.votar(eleccionSeleccionada.id, candidato_id);
      setSuccess("Tu voto fue registrado correctamente.");
      setYaVote(true);
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      handleError(err, "No se pudo registrar tu voto");
    }
  };

  const handleVerResultados = async (eleccion: Eleccion) => {
    try {
      setCargandoDetalle(true);
      setError(null);

      const datos = await eleccionService.getResultados(eleccion.id);
      const filas: FilaResultado[] = (datos?.resultados || []).map(
        (item: any) => ({
          id: item.candidato?.id ?? 0,
          nombre: item.candidato?.nombre ?? "Candidato",
          partido: item.candidato?.partido?.nombre ?? null,
          votos: item.votos ?? 0,
          porcentaje: item.porcentaje ?? 0,
        }),
      );

      setResultados({
        titulo: datos?.eleccion?.titulo ?? eleccion.titulo,
        totalVotos: datos?.total_votos ?? 0,
        filas,
      });
      setVista("resultados");
    } catch (err: any) {
      handleError(
        err,
        "Los resultados de esta elección todavía no están disponibles",
      );
    } finally {
      setCargandoDetalle(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex items-center gap-3 text-gray-600">
          <svg
            className="w-5 h-5 animate-spin text-[#04ADBF]"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          Cargando elecciones...
        </div>
      </div>
    );
  }

  if (vista === "resultados" && resultados) {
    const maximo = Math.max(...resultados.filas.map((fila) => fila.votos), 1);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="secondary" onClick={volverAlListado}>
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Resultados oficiales
            </h1>
            <p className="text-sm text-gray-500">{resultados.titulo}</p>
          </div>
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError(null)} />
        )}

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Votos emitidos</p>
              <p className="text-3xl font-bold text-gray-800">
                {resultados.totalVotos}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800">
              Publicados por el comité electoral
            </span>
          </div>

          {resultados.filas.length === 0 ? (
            <p className="text-center text-gray-600 py-6">
              Esta elección no registró votos.
            </p>
          ) : (
            <ul className="space-y-4">
              {resultados.filas.map((fila, indice) => (
                <li key={`${fila.id}-${indice}`}>
                  <div className="flex items-center justify-between mb-1 gap-3">
                    <div>
                      <span className="font-semibold text-gray-800">
                        {fila.nombre}
                      </span>
                      {fila.partido && (
                        <span className="ml-2 text-sm text-gray-500">
                          {fila.partido}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 whitespace-nowrap">
                      <span className="font-semibold text-gray-800">
                        {fila.votos}
                      </span>{" "}
                      votos · {fila.porcentaje}%
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#04ADBF]"
                      style={{
                        width: `${Math.round((fila.votos / maximo) * 100)}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    );
  }

  // Vista de detalle de elección
  if (vista === "detalle" && eleccionSeleccionada) {
    const estado = estadoVisual(eleccionSeleccionada);
    const abierta = votacionAbierta(eleccionSeleccionada);
    const puedeVotar = esEstudiante && abierta && !yaVote;

    return (
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <Button variant="secondary" onClick={volverAlListado}>
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {eleccionSeleccionada.titulo}
            </h1>
            <span
              className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${clasesEstado(estado)}`}
            >
              {etiquetaEstado(estado)}
            </span>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Apertura de la votación</p>
              <p className="font-semibold text-gray-800">
                {formatoFecha(eleccionSeleccionada.fecha_inicio)}{" "}
                {formatoHora(eleccionSeleccionada.fecha_inicio)}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Cierre de la votación</p>
              <p className="font-semibold text-gray-800">
                {formatoFecha(eleccionSeleccionada.fecha_cierre)}{" "}
                {formatoHora(eleccionSeleccionada.fecha_cierre)}
              </p>
            </div>
          </div>
        </Card>

        {yaVote && (
          <Alert
            type="success"
            message="Ya registraste tu voto en esta elección. Gracias por participar."
          />
        )}

        {esEstudiante && !abierta && (
          <Alert
            type="info"
            message={
              estado === "proxima"
                ? "La votación aún no inicia. Vuelve cuando llegue la fecha de apertura."
                : "La votación ya finalizó. Los resultados se publicarán cuando el comité electoral los oficialice."
            }
          />
        )}

        {eleccionSeleccionada.candidatos &&
        eleccionSeleccionada.candidatos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eleccionSeleccionada.candidatos.map((candidato) => (
              <Card key={candidato.id}>
                <div className="text-center mb-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 leading-tight">
                    {candidato.nombre}
                  </h3>
                  {candidato.partido?.nombre &&
                    !candidato.nombre
                      .toLowerCase()
                      .includes(candidato.partido.nombre.toLowerCase()) && (
                      <p className="text-sm text-gray-500 mt-1">
                        {candidato.partido.nombre}
                      </p>
                    )}
                </div>

                {puedeVotar ? (
                  <Button
                    className="w-full"
                    onClick={() => handleVotar(candidato.id)}
                  >
                    Votar por esta lista
                  </Button>
                ) : (
                  <div className="text-center text-sm text-gray-500 border-t border-gray-100 pt-3">
                    {yaVote
                      ? "Voto registrado"
                      : abierta
                        ? "Solo los estudiantes pueden votar"
                        : "Votación no disponible"}
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <p className="text-center text-gray-600 py-6">
              Esta elección todavía no tiene listas registradas.
            </p>
          </Card>
        )}
      </div>
    );
  }

  // Vista principal de elecciones
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-800">
          Elecciones escolares
        </h1>
        <Button
          variant="secondary"
          onClick={loadElecciones}
          disabled={cargandoDetalle}
        >
          Actualizar
        </Button>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      {elecciones.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-700 font-medium">
              No hay elecciones registradas
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Cuando el comité electoral programe una elección aparecerá en esta
              sección.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {elecciones.map((eleccion) => {
            const estado = estadoVisual(eleccion);
            const puedeVerResultados =
              eleccion.estado === "cerrada" &&
              eleccion.resultados_publicados === true;

            return (
              <Card
                key={eleccion.id}
                className={estado !== "activa" ? "bg-gray-50" : ""}
              >
                <div className="flex justify-between items-start gap-3 mb-3">
                  <h3 className="text-lg font-bold text-gray-800 leading-tight">
                    {eleccion.titulo}
                  </h3>
                  <span
                    className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${clasesEstado(estado)}`}
                  >
                    {etiquetaEstado(estado)}
                  </span>
                </div>

                <div className="space-y-1 text-sm text-gray-600 mb-4">
                  {eleccion.fecha_inicio && eleccion.fecha_cierre ? (
                    <>
                      <p>
                        <span className="text-gray-500">Apertura:</span>{" "}
                        {formatoFecha(eleccion.fecha_inicio)} ·{" "}
                        {formatoHora(eleccion.fecha_inicio)}
                      </p>
                      <p>
                        <span className="text-gray-500">Cierre:</span>{" "}
                        {formatoFecha(eleccion.fecha_cierre)} ·{" "}
                        {formatoHora(eleccion.fecha_cierre)}
                      </p>
                    </>
                  ) : (
                    <p>
                      <span className="text-gray-500">Fecha:</span>{" "}
                      {formatoFecha(eleccion.fecha)}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    className="flex-1 min-w-[150px]"
                    variant={estado === "activa" ? "primary" : "secondary"}
                    onClick={() => handleVerEleccion(eleccion)}
                  >
                    {estado === "activa" ? "Ir a votar" : "Ver listas"}
                  </Button>

                  {puedeVerResultados && (
                    <Button
                      className="flex-1 min-w-[150px]"
                      onClick={() => handleVerResultados(eleccion)}
                      disabled={cargandoDetalle}
                    >
                      Ver resultados
                    </Button>
                  )}

                  {eleccion.estado === "cerrada" && !puedeVerResultados && (
                    <span className="flex-1 min-w-[150px] flex items-center justify-center text-xs text-gray-500 border border-dashed border-gray-300 rounded-md px-3 py-2 text-center">
                      Resultados aún no publicados
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
