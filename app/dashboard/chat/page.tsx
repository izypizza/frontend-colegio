"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, Button, Modal } from "@/src/components/ui";
import { chatService, padrePortalService } from "@/src/lib/services";
import { ChatConversacion } from "@/src/types/models";
import Link from "next/link";
import { useAuth } from "@/src/features/auth";

export default function ChatPage() {
  const { user } = useAuth();
  const [conversaciones, setConversaciones] = useState<ChatConversacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [hijos, setHijos] = useState<any[]>([]);
  const [selectedHijo, setSelectedHijo] = useState<number | null>(null);
  const [docentes, setDocentes] = useState<any[]>([]);
  const [selectedDocente, setSelectedDocente] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchConversaciones();
    if (user?.role === "padre") {
      fetchHijos();
    }
  }, [user?.role, fetchConversaciones, fetchHijos]);

  const fetchConversaciones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = (await chatService.getConversaciones()) as {
        data: ChatConversacion[];
      };
      setConversaciones(response.data || []);
    } catch (err: any) {
      setError(err.message || "Error al cargar conversaciones");
      console.error("Error al cargar conversaciones:", err);
    } finally {
      setLoading(false);
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
      // Usar el nuevo endpoint específico para padres
      const response: any = await padrePortalService.docentesHijo(hijoId);
      setDocentes(response.docentes || []);
    } catch (err) {
      console.error("Error al cargar docentes:", err);
      setDocentes([]);
    }
  }, []);

  const handleIniciarConversacion = async () => {
    if (!selectedHijo || !selectedDocente) {
      alert("Selecciona un hijo y un docente");
      return;
    }

    try {
      setCreating(true);
      const padre = user?.padre;

      if (!padre) {
        alert(
          "Sesión no actualizada. Por favor, cierra sesión y vuelve a iniciar sesión para continuar.",
        );
        return;
      }

      const data = {
        docente_id: selectedDocente,
        padre_id: padre.id,
        estudiante_id: selectedHijo,
      };

      const response: any = await chatService.crearConversacion(data);

      // Recargar conversaciones
      await fetchConversaciones();

      // Cerrar modal
      setShowModal(false);
      setSelectedHijo(null);
      setSelectedDocente(null);
      setDocentes([]);

      // Navegar a la nueva conversación
      window.location.href = `/dashboard/chat/${response.id}`;
    } catch (err: any) {
      console.error("Error al crear conversación:", err);
      alert(err.message || "Error al crear conversación");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getRoleName = () => {
    if (user?.role === "docente") return "Docente";
    if (user?.role === "padre") return "Padre/Madre";
    return "Usuario";
  };

  const getDescription = () => {
    if (user?.role === "docente") {
      return "Comunícate con los padres de familia de tus estudiantes para mantenerlos informados sobre el progreso académico y comportamiento.";
    }
    if (user?.role === "padre") {
      return "Mantente en contacto con los docentes de tus hijos para estar al tanto de su desempeño escolar y resolver dudas.";
    }
    return "Sistema de mensajería entre docentes y padres de familia.";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              Chat Docente-Padre
            </h1>
            <p className="mt-2 text-blue-100">{getDescription()}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                {getRoleName()}
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                {conversaciones.length} conversación(es)
              </span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Card>
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
            {error}
          </div>
        </Card>
      )}

      {/* Instrucciones */}
      <Card>
        <div className="p-6 bg-blue-50 border-l-4 border-l-blue-600">
          <h3 className="font-semibold text-gray-900 mb-2">¿Cómo funciona?</h3>
          <ul className="space-y-1 text-sm text-gray-700">
            {user?.role === "docente" ? (
              <>
                <li>
                  • Las conversaciones se crean automáticamente cuando un padre
                  te escribe
                </li>
                <li>
                  • Puedes ver el historial completo de mensajes con cada padre
                </li>
                <li>
                  • Los padres pueden iniciar conversaciones sobre sus hijos
                </li>
              </>
            ) : (
              <>
                <li>
                  • Puedes iniciar conversaciones con los docentes de tus hijos
                </li>
                <li>• Haz clic en "Ver Chat" para enviar y recibir mensajes</li>
                <li>• Mantén una comunicación respetuosa y constructiva</li>
              </>
            )}
          </ul>
        </div>
      </Card>

      {/* Botón para iniciar conversación (solo padres) */}
      {user?.role === "padre" && (
        <div className="flex justify-end">
          <Button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg font-medium shadow-lg"
          >
            Iniciar Nueva Conversación
          </Button>
        </div>
      )}

      {/* Lista de Conversaciones */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Mis Conversaciones
          </h2>

          {conversaciones.length === 0 ? (
            <div className="text-center py-12">
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
              <p className="mt-4 text-gray-600 font-medium">
                No tienes conversaciones aún
              </p>
              <p className="mt-2 text-sm text-gray-500">
                {user?.role === "docente"
                  ? "Los padres pueden iniciar conversaciones contigo"
                  : "Inicia una conversación con un docente"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversaciones.map((conv: any) => {
                const contacto =
                  user?.role === "docente" ? conv.padre : conv.docente;
                const nombreContacto = contacto
                  ? `${contacto.nombres} ${contacto.apellido_paterno || ""}`
                  : "Usuario";

                return (
                  <Link
                    key={conv.id}
                    href={`/dashboard/chat/${conv.id}`}
                    className="block"
                  >
                    <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-500 transition-all cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {/* Avatar */}
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {nombreContacto.charAt(0).toUpperCase()}
                          </div>

                          {/* Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">
                                {nombreContacto}
                              </h3>
                              <span
                                className={`px-2 py-0.5 text-xs rounded ${
                                  user?.role === "docente"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {user?.role === "docente" ? "Padre" : "Docente"}
                              </span>
                            </div>
                            {conv.estudiante && (
                              <p className="text-sm text-gray-600 mb-1">
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

                        {/* Botón */}
                        <Button className="ml-4">Ver Chat →</Button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Modal para iniciar conversación */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedHijo(null);
            setSelectedDocente(null);
            setDocentes([]);
          }}
          title="Iniciar Nueva Conversación"
        >
          <div className="space-y-4">
            {/* Seleccionar hijo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecciona tu hijo/hija
              </label>
              <select
                value={selectedHijo || ""}
                onChange={(e) => {
                  const hijoId = parseInt(e.target.value);
                  setSelectedHijo(hijoId);
                  setSelectedDocente(null);
                  if (hijoId) {
                    fetchDocentes(hijoId);
                  } else {
                    setDocentes([]);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Selecciona --</option>
                {hijos.map((hijo) => (
                  <option key={hijo.id} value={hijo.id}>
                    {hijo.nombre} {hijo.apellido} -{" "}
                    {hijo.seccion?.grado?.nombre} "{hijo.seccion?.nombre}"
                  </option>
                ))}
              </select>
            </div>

            {/* Seleccionar docente */}
            {selectedHijo && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecciona el docente
                </label>
                {docentes.length === 0 ? (
                  <p className="text-sm text-gray-500 py-2">
                    Cargando docentes...
                  </p>
                ) : (
                  <select
                    value={selectedDocente || ""}
                    onChange={(e) =>
                      setSelectedDocente(parseInt(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Selecciona --</option>
                    {docentes.map((docente) => (
                      <option key={docente.id} value={docente.id}>
                        {docente.nombres} {docente.apellido_paterno}
                        {docente.especialidad && ` - ${docente.especialidad}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                onClick={() => {
                  setShowModal(false);
                  setSelectedHijo(null);
                  setSelectedDocente(null);
                  setDocentes([]);
                }}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleIniciarConversacion}
                disabled={!selectedHijo || !selectedDocente || creating}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {creating ? "Creando..." : "Iniciar Conversación"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
