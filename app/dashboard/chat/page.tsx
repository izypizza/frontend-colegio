"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, Button, Modal, SelectBuscable } from "@/src/components/ui";
import {
  chatService,
  docentePortalService,
  padrePortalService,
} from "@/src/lib/services";
import { ChatConversacion } from "@/src/types/models";
import Link from "next/link";
import { useAuth } from "@/src/features/auth";
import { useAutoRefresh } from "@/src/hooks/useAutoRefresh";

export default function ChatPage() {
  const { user } = useAuth();
  const [conversaciones, setConversaciones] = useState<ChatConversacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [hijos, setHijos] = useState<any[]>([]);
  const [docentes, setDocentes] = useState<any[]>([]);
  const [padres, setPadres] = useState<any[]>([]);

  const [selectedHijo, setSelectedHijo] = useState<number | null>(null);
  const [selectedDocente, setSelectedDocente] = useState<number | null>(null);
  const [selectedPadre, setSelectedPadre] = useState<number | null>(null);
  const [selectedEstudiante, setSelectedEstudiante] = useState<number | null>(
    null,
  );

  const esDocente = user?.role === "docente";
  const esPadre = user?.role === "padre";

  const fetchConversaciones = useCallback(async (silencioso = false) => {
    try {
      if (!silencioso) {
        setLoading(true);
        setError(null);
      }
      const response = (await chatService.getConversaciones()) as {
        data: ChatConversacion[];
      };
      setConversaciones(response.data || []);
    } catch (err: any) {
      if (!silencioso) {
        setError(err.message || "Error al cargar conversaciones");
      }
      console.error("Error al cargar conversaciones:", err);
    } finally {
      if (!silencioso) {
        setLoading(false);
      }
    }
  }, []);

  const fetchHijos = useCallback(async () => {
    try {
      const response: any = await padrePortalService.misHijos();
      setHijos(response.hijos || []);
    } catch (err) {
      console.error("Error al cargar hijos:", err);
    }
  }, []);

  const fetchDocentes = useCallback(async (hijoId: number) => {
    try {
      const response: any = await padrePortalService.docentesHijo(hijoId);
      setDocentes(response.docentes || []);
    } catch (err) {
      console.error("Error al cargar docentes:", err);
      setDocentes([]);
    }
  }, []);

  const fetchPadres = useCallback(async () => {
    try {
      const response: any = await docentePortalService.misPadres();
      setPadres(response.padres || []);
    } catch (err) {
      console.error("Error al cargar padres de familia:", err);
      setPadres([]);
    }
  }, []);

  const cerrarModal = () => {
    setShowModal(false);
    setSelectedHijo(null);
    setSelectedDocente(null);
    setSelectedPadre(null);
    setSelectedEstudiante(null);
    setDocentes([]);
  };

  const handleIniciarConversacion = async () => {
    try {
      setError(null);
      setCreating(true);

      // El backend toma al usuario autenticado como participante, así que solo
      // hace falta indicar a la contraparte.
      const data = esDocente
        ? {
            padre_id: selectedPadre,
            estudiante_id: selectedEstudiante ?? undefined,
          }
        : {
            docente_id: selectedDocente,
            estudiante_id: selectedHijo ?? undefined,
          };

      const response: any = await chatService.crearConversacion(data);

      await fetchConversaciones();
      cerrarModal();
      window.location.href = `/dashboard/chat/${response.id}`;
    } catch (err: any) {
      console.error("Error al crear conversación:", err);
      setError(err.message || "No se pudo iniciar la conversación");
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    fetchConversaciones();
    if (esPadre) fetchHijos();
    if (esDocente) fetchPadres();
  }, [esPadre, esDocente, fetchConversaciones, fetchHijos, fetchPadres]);

  useAutoRefresh(() => fetchConversaciones(true), {
    intervaloMs: 20000,
    activo: Boolean(user),
  });

  const padreElegido = padres.find((padre) => padre.id === selectedPadre);

  const opcionesHijos = hijos.map((hijo) => ({
    valor: hijo.id,
    etiqueta: `${hijo.nombre} ${hijo.apellido}`,
    detalle: hijo.seccion
      ? `${hijo.seccion.grado?.nombre ?? ""} ${hijo.seccion.nombre}`.trim()
      : null,
  }));

  const opcionesDocentes = docentes.map((docente) => ({
    valor: docente.id,
    etiqueta: `${docente.nombres} ${docente.apellido_paterno ?? ""}`.trim(),
    detalle: docente.especialidad ?? null,
  }));

  const opcionesPadres = padres.map((padre) => ({
    valor: padre.id,
    etiqueta: `${padre.apellido_paterno ?? ""} ${
      padre.apellido_materno ?? ""
    }, ${padre.nombres ?? ""}`.trim(),
    detalle: `${padre.estudiantes?.length ?? 0} estudiante(s)`,
  }));

  const opcionesEstudiantesDelPadre = (padreElegido?.estudiantes ?? []).map(
    (estudiante: any) => ({
      valor: estudiante.id,
      etiqueta: `${estudiante.apellido_paterno ?? ""} ${
        estudiante.apellido_materno ?? ""
      }, ${estudiante.nombres ?? ""}`.trim(),
    }),
  );

  const puedeIniciar = esDocente
    ? Boolean(selectedPadre)
    : Boolean(selectedHijo && selectedDocente);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#04ADBF]"></div>
      </div>
    );
  }

  const getRoleName = () => {
    if (esDocente) return "Docente";
    if (esPadre) return "Padre/Madre";
    return "Usuario";
  };

  const getDescription = () => {
    if (esDocente) {
      return "Comunícate con los padres de familia de tus estudiantes para mantenerlos informados sobre el progreso académico y comportamiento.";
    }
    if (esPadre) {
      return "Mantente en contacto con los docentes de tus hijos para estar al tanto de su desempeño escolar y resolver dudas.";
    }
    return "Sistema de mensajería entre docentes y padres de familia.";
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-[#04ADBF] p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold">
              Chat Docente-Padre
            </h1>
            <p className="mt-2 text-blue-100">{getDescription()}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-sm">
                {getRoleName()}
              </span>
              <span className="rounded-full bg-white/20 px-3 py-1 text-sm">
                {conversaciones.length} conversación(es)
              </span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Card>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            {error}
          </div>
        </Card>
      )}

      <Card>
        <div className="border-l-4 border-l-blue-600 bg-blue-50 p-6">
          <h3 className="mb-2 font-semibold text-gray-900">¿Cómo funciona?</h3>
          <ul className="space-y-1 text-sm text-gray-700">
            {esDocente ? (
              <>
                <li>
                  • Puedes iniciar una conversación con los padres de familia de
                  tus secciones
                </li>
                <li>• También recibirás las conversaciones que ellos abran</li>
                <li>• Ambos pueden escribir y ver el historial completo</li>
              </>
            ) : (
              <>
                <li>• Puedes iniciar conversaciones con los docentes de tus hijos</li>
                <li>• Haz clic en "Ver Chat" para enviar y recibir mensajes</li>
                <li>• Mantén una comunicación respetuosa y constructiva</li>
              </>
            )}
          </ul>
        </div>
      </Card>

      {(esPadre || esDocente) && (
        <div className="flex justify-end">
          <Button
            onClick={() => setShowModal(true)}
            className="rounded-lg bg-[#04ADBF] px-6 py-2 font-medium text-white shadow-sm transition-colors hover:bg-[#038a9a]"
          >
            Iniciar nueva conversación
          </Button>
        </div>
      )}

      <Card>
        <div className="p-6">
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            Mis conversaciones
          </h2>

          {conversaciones.length === 0 ? (
            <div className="py-12 text-center">
              <svg
                className="mx-auto h-16 w-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="mt-4 font-medium text-gray-600">
                No tienes conversaciones aún
              </p>
              <p className="mt-2 text-sm text-gray-500">
                {esDocente
                  ? "Inicia una conversación con un padre de familia"
                  : "Inicia una conversación con un docente"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversaciones.map((conv: any) => {
                const contacto = esDocente ? conv.padre : conv.docente;
                const nombreContacto = contacto
                  ? `${contacto.nombres} ${contacto.apellido_paterno || ""}`
                  : "Usuario";

                return (
                  <Link
                    key={conv.id}
                    href={`/dashboard/chat/${conv.id}`}
                    className="block"
                  >
                    <div className="cursor-pointer rounded-lg border border-gray-200 p-4 transition-all hover:border-blue-500 hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-1 items-start gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#04ADBF] text-lg font-bold text-white">
                            {nombreContacto.charAt(0).toUpperCase()}
                          </div>

                          <div className="flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900">
                                {nombreContacto}
                              </h3>
                              <span
                                className={`rounded px-2 py-0.5 text-xs ${
                                  esDocente
                                    ? "bg-green-100 text-green-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {esDocente ? "Padre" : "Docente"}
                              </span>
                            </div>
                            {conv.estudiante && (
                              <p className="mb-1 text-sm text-gray-600">
                                Estudiante:{" "}
                                {`${conv.estudiante.nombres} ${conv.estudiante.apellido_paterno || ""}`}
                              </p>
                            )}
                            {conv.ultimo_mensaje_at && (
                              <p className="text-xs text-gray-500">
                                Última actividad:{" "}
                                {new Date(
                                  conv.ultimo_mensaje_at,
                                ).toLocaleString("es-PE", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            )}
                          </div>
                        </div>

                        <Button className="ml-4">Ver chat →</Button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={cerrarModal}
          title="Iniciar nueva conversación"
          footer={
            <>
              <Button variant="secondary" onClick={cerrarModal}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleIniciarConversacion}
                disabled={!puedeIniciar || creating}
              >
                {creating ? "Creando..." : "Iniciar conversación"}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
                {error}
              </div>
            )}

            {esDocente ? (
              <>
                <SelectBuscable
                  label="Padre de familia"
                  opciones={opcionesPadres}
                  valor={selectedPadre ?? ""}
                  onChange={(valor) => {
                    setSelectedPadre(valor ? parseInt(valor) : null);
                    setSelectedEstudiante(null);
                  }}
                  vacio="Seleccionar padre"
                  placeholder="Buscar por apellido o nombre"
                  required
                />

                {selectedPadre && opcionesEstudiantesDelPadre.length > 0 && (
                  <SelectBuscable
                    label="Estudiante (opcional)"
                    opciones={opcionesEstudiantesDelPadre}
                    valor={selectedEstudiante ?? ""}
                    onChange={(valor) =>
                      setSelectedEstudiante(valor ? parseInt(valor) : null)
                    }
                    vacio="Sin especificar"
                    placeholder="Buscar estudiante"
                  />
                )}

                {padres.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No tienes padres de familia vinculados a tus secciones.
                  </p>
                )}
              </>
            ) : (
              <>
                <SelectBuscable
                  label="Estudiante"
                  opciones={opcionesHijos}
                  valor={selectedHijo ?? ""}
                  onChange={(valor) => {
                    const hijoId = valor ? parseInt(valor) : null;
                    setSelectedHijo(hijoId);
                    setSelectedDocente(null);

                    if (hijoId) {
                      fetchDocentes(hijoId);
                    } else {
                      setDocentes([]);
                    }
                  }}
                  vacio="Seleccionar estudiante"
                  placeholder="Buscar estudiante"
                  required
                />

                {selectedHijo && (
                  <SelectBuscable
                    label="Docente"
                    opciones={opcionesDocentes}
                    valor={selectedDocente ?? ""}
                    onChange={(valor) =>
                      setSelectedDocente(valor ? parseInt(valor) : null)
                    }
                    vacio="Seleccionar docente"
                    placeholder="Buscar docente"
                    disabled={docentes.length === 0}
                    required
                  />
                )}
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
