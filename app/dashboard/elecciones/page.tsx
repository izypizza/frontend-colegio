"use client";

import { useState, useEffect } from "react";
import { eleccionService, votoService } from "@/src/lib/services";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Alert } from "@/src/components/ui/Alert";
import { useAuth } from "@/src/features/auth/hooks/useAuth";

interface Candidato {
  id: number;
  eleccion_id: number;
  nombre: string;
  votos_count?: number;
}

interface Eleccion {
  id: number;
  titulo: string;
  fecha: string;
  estado?: string;
  fecha_inicio?: string;
  fecha_cierre?: string;
  candidatos?: Candidato[];
}

export default function EleccionesPage() {
  const { user } = useAuth();
  const [elecciones, setElecciones] = useState<Eleccion[]>([]);
  const [eleccionSeleccionada, setEleccionSeleccionada] =
    useState<Eleccion | null>(null);
  const [yaVote, setYaVote] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadElecciones();
  }, []);

  const loadElecciones = async () => {
    try {
      setLoading(true);
      const data = await eleccionService.getAll();
      setElecciones(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Error al cargar las elecciones");
    } finally {
      setLoading(false);
    }
  };

  const handleVerEleccion = async (eleccion: Eleccion) => {
    try {
      const [detalleEleccion, voteStatus] = await Promise.all([
        eleccionService.getById(eleccion.id),
        eleccionService.yaVote(eleccion.id),
      ]);

      setEleccionSeleccionada(detalleEleccion);
      setYaVote(voteStatus?.ya_voto || false);
    } catch (err: any) {
      setError(err.message || "Error al cargar la elección");
    }
  };

  const handleVotar = async (candidato_id: number) => {
    if (!eleccionSeleccionada) return;

    if (!confirm("¿Confirmar voto? Esta acción no se puede deshacer.")) return;

    try {
      await votoService.votar(eleccionSeleccionada.id, candidato_id);
      setSuccess("¡Voto registrado exitosamente!");
      setYaVote(true);
      setTimeout(() => {
        setSuccess(null);
        setEleccionSeleccionada(null);
        loadElecciones();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Error al registrar el voto");
    }
  };

  const handleVerResultados = async (eleccion_id: number) => {
    try {
      const resultados = await eleccionService.getResultados(eleccion_id);

      if (resultados) {
        setEleccionSeleccionada({
          ...resultados,
          candidatos: resultados.candidatos || [],
        });
      }
    } catch (err: any) {
      setError(err.message || "Error al cargar los resultados");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  // Vista de detalle de elección
  if (eleccionSeleccionada) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="secondary"
            onClick={() => setEleccionSeleccionada(null)}
          >
            ← Volver
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">
            {eleccionSeleccionada.titulo}
          </h1>
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
          <div className="flex space-x-4 text-sm text-gray-500">
            <div>
              <strong>Fecha:</strong>{" "}
              {new Date(eleccionSeleccionada.fecha).toLocaleDateString()}
            </div>
          </div>
        </Card>

        {yaVote && (
          <Alert type="success" message="Ya has votado en esta elección" />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eleccionSeleccionada.candidatos?.map((candidato) => {
            return (
              <Card key={candidato.id}>
                <div className="text-center mb-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-gray-400"
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
                  <h3 className="text-xl font-bold text-gray-800">
                    {candidato.nombre}
                  </h3>
                </div>

                {candidato.votos_count !== undefined && (
                  <div className="text-center py-3 bg-gray-100 rounded-md mb-3">
                    <div className="text-2xl font-bold text-[#04ADBF]">
                      {candidato.votos_count}
                    </div>
                    <div className="text-sm text-gray-600">Votos</div>
                  </div>
                )}

                {!yaVote && user?.role === "estudiante" && (
                  <Button
                    className="w-full"
                    onClick={() => handleVotar(candidato.id)}
                  >
                    Votar
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Vista principal de elecciones
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">
          Elecciones Escolares
        </h1>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      {elecciones.length === 0 ? (
        <Card>
          <p className="text-center text-gray-600">
            No hay elecciones disponibles en este momento.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {elecciones.map((eleccion) => {
            const esActiva = eleccion.estado === "activa";
            const esPendiente = eleccion.estado === "pendiente";
            const esCerrada = eleccion.estado === "cerrada";

            return (
              <Card
                key={eleccion.id}
                className={!esActiva ? "opacity-75 bg-gray-50" : ""}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-800">
                    {eleccion.titulo}
                  </h3>
                  {eleccion.estado && (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        esActiva
                          ? "bg-green-100 text-green-800"
                          : esPendiente
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {esActiva
                        ? "Activa"
                        : esPendiente
                        ? "Próximamente"
                        : "Cerrada"}
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-sm text-gray-500 mb-4">
                  {eleccion.fecha_inicio && eleccion.fecha_cierre ? (
                    <>
                      <div>
                        <strong>Inicio:</strong>{" "}
                        {new Date(eleccion.fecha_inicio).toLocaleDateString(
                          "es-PE",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </div>
                      <div>
                        <strong>Cierre:</strong>{" "}
                        {new Date(eleccion.fecha_cierre).toLocaleDateString(
                          "es-PE",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </div>
                    </>
                  ) : (
                    <div>
                      <strong>Fecha:</strong>{" "}
                      {new Date(eleccion.fecha).toLocaleDateString()}
                    </div>
                  )}
                  {!esActiva && (
                    <p className="text-xs text-gray-600 italic mt-2">
                      {esPendiente
                        ? "Esta elección aún no está disponible"
                        : "Esta elección ha finalizado"}
                    </p>
                  )}
                </div>

                <div className="flex space-x-2">
                  {user?.role === "estudiante" ? (
                    <Button
                      className="flex-1"
                      onClick={() => handleVerEleccion(eleccion)}
                      disabled={!esActiva}
                    >
                      {esActiva
                        ? "Votar"
                        : esPendiente
                        ? "Próximamente"
                        : "Cerrada"}
                    </Button>
                  ) : (
                    <Button
                      className="flex-1"
                      variant="secondary"
                      onClick={() => handleVerResultados(eleccion.id)}
                    >
                      Ver Resultados
                    </Button>
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
