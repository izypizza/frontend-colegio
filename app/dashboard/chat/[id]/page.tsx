"use client";

import { useEffect, useState, useRef } from "react";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { chatService } from "@/src/lib/services";
import { ChatMensaje } from "@/src/types/models";
import { useAuth } from "@/src/features/auth";
import { useParams } from "next/navigation";

export default function ChatMensajesPage() {
  const params = useParams();
  const conversacionId = Number(params.id);
  const { user } = useAuth();
  const [mensajes, setMensajes] = useState<ChatMensaje[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [sending, setSending] = useState(false);
  const [otroParticipante, setOtroParticipante] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMensajes();
    const interval = setInterval(fetchMensajes, 5000); // Refrescar cada 5 segundos
    return () => clearInterval(interval);
  }, [conversacionId]);

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMensajes = async () => {
    try {
      setLoading(true);
      const response = (await chatService.getMensajes(conversacionId)) as {
        data: any[];
      };
      setMensajes(response.data);

      // Detectar el otro participante (el primer mensaje que no sea del usuario actual)
      if (response.data.length > 0 && !otroParticipante) {
        const otroMensaje = response.data.find(
          (m: any) => m.user_id !== user?.id
        );
        if (otroMensaje?.user?.name) {
          setOtroParticipante(otroMensaje.user.name);
        }
      }
    } catch (error) {
      console.error("Error al cargar mensajes:", error);
    } finally {
      setLoading(false);
    }
  };

  const enviarMensaje = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mensaje.trim()) return;

    try {
      setSending(true);
      await chatService.enviarMensaje(conversacionId, { mensaje });
      setMensaje("");
      fetchMensajes();
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
    } finally {
      setSending(false);
    }
  };

  // Función para obtener iniciales del nombre
  const getInitials = (name: string) => {
    const words = name.split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Función para obtener color del avatar basado en el user_id
  const getAvatarColor = (userId: number) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-yellow-500",
      "bg-red-500",
    ];
    return colors[userId % colors.length];
  };

  if (loading && mensajes.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#04ADBF]"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      {/* Encabezado de la conversación */}
      <div className="mb-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          {/* Avatar del participante */}
          {otroParticipante && (
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${getAvatarColor(mensajes.find((m: any) => m.user_id !== user?.id)?.user_id || 0)}`}
            >
              {getInitials(otroParticipante)}
            </div>
          )}

          {/* Información */}
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">
              {otroParticipante || "Conversación"}
            </h1>
            <p className="text-sm text-gray-500">
              {mensajes.length > 0
                ? `${mensajes.length} mensaje${mensajes.length !== 1 ? "s" : ""}`
                : "Nueva conversación"}
            </p>
          </div>

          {/* Indicador de estado (online/offline - opcional) */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Activo</span>
          </div>
        </div>
      </div>

      <Card className="flex-1 flex flex-col">
        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {mensajes.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-400"
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
              <p className="text-gray-500 font-medium">No hay mensajes aún</p>
              <p className="text-sm text-gray-400 mt-2">
                Inicia la conversación enviando un mensaje
              </p>
            </div>
          ) : (
            mensajes.map((msg: any, index: number) => {
              const isMine = msg.user_id === user?.id;
              const showAvatar =
                index === 0 || mensajes[index - 1]?.user_id !== msg.user_id;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${isMine ? "justify-end" : "justify-start"}`}
                >
                  {/* Avatar (solo para mensajes del otro usuario) */}
                  {!isMine && (
                    <div className="flex-shrink-0">
                      {showAvatar ? (
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${getAvatarColor(msg.user_id)}`}
                          title={msg.user?.name || "Usuario"}
                        >
                          {getInitials(msg.user?.name || "Usuario")}
                        </div>
                      ) : (
                        <div className="w-10 h-10" />
                      )}
                    </div>
                  )}

                  {/* Mensaje */}
                  <div
                    className={`flex flex-col ${isMine ? "items-end" : "items-start"} max-w-xs lg:max-w-md`}
                  >
                    {/* Nombre del usuario (solo si es el primer mensaje de ese usuario o cambió de usuario) */}
                    {showAvatar && (
                      <span
                        className={`text-xs font-semibold mb-1 px-1 ${
                          isMine ? "text-[#04ADBF]" : "text-gray-700"
                        }`}
                      >
                        {isMine ? "Tú" : msg.user?.name || "Usuario"}
                      </span>
                    )}

                    {/* Burbuja del mensaje */}
                    <div
                      className={`px-4 py-2 rounded-2xl shadow-sm ${
                        isMine
                          ? "bg-[#04ADBF] text-white rounded-br-sm"
                          : "bg-white text-gray-900 rounded-bl-sm border border-gray-200"
                      }`}
                    >
                      <p className="break-words whitespace-pre-wrap">
                        {msg.mensaje}
                      </p>
                    </div>

                    {/* Hora y estado de lectura */}
                    <div
                      className={`flex items-center gap-1 mt-1 px-1 ${
                        isMine ? "justify-end" : "justify-start"
                      }`}
                    >
                      <span className="text-xs text-gray-500">
                        {new Date(msg.created_at).toLocaleTimeString("es-PE", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {isMine && msg.leido_at && (
                        <svg
                          className="w-4 h-4 text-blue-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          title="Leído"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      {isMine && !msg.leido_at && (
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          title="Enviado"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Avatar espacio para mensajes propios (mantener alineación) */}
                  {isMine && <div className="w-10 flex-shrink-0" />}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {user?.role !== "admin" ? (
          <form
            onSubmit={enviarMensaje}
            className="border-t bg-white p-4 flex gap-3 items-end"
          >
            <div className="flex-1">
              <textarea
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    enviarMensaje(e);
                  }
                }}
                placeholder="Escribe un mensaje... (Enter para enviar, Shift+Enter para nueva línea)"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#04ADBF] focus:border-transparent resize-none"
                rows={2}
                disabled={sending}
              />
            </div>
            <Button
              type="submit"
              disabled={sending || !mensaje.trim()}
              className="px-6 py-2 h-10 flex items-center gap-2"
            >
              {sending ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <span>Enviar</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </>
              )}
            </Button>
          </form>
        ) : (
          <div className="border-t p-4 bg-yellow-50 text-center flex items-center justify-center gap-2">
            <svg
              className="w-5 h-5 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-gray-700 text-sm font-medium">
              Los administradores solo pueden visualizar conversaciones
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
