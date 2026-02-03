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

  if (loading && mensajes.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#04ADBF]"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Conversación</h1>
      </div>

      <Card className="flex-1 flex flex-col">
        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {mensajes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay mensajes aún</p>
              <p className="text-sm text-gray-400 mt-2">
                Inicia la conversación
              </p>
            </div>
          ) : (
            mensajes.map((msg: any) => {
              const isMine = msg.user_id === user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isMine
                        ? "bg-[#04ADBF] text-white"
                        : "bg-gray-200 text-gray-900"
                    }`}
                  >
                    <p className="break-words">{msg.mensaje}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isMine ? "text-white/80" : "text-gray-600"
                      }`}
                    >
                      {new Date(msg.created_at).toLocaleTimeString("es-PE", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
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
            className="border-t p-4 flex gap-2 bg-gray-50"
          >
            <Input
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1"
              disabled={sending}
            />
            <Button type="submit" disabled={sending || !mensaje.trim()}>
              {sending ? "Enviando..." : "Enviar"}
            </Button>
          </form>
        ) : (
          <div className="border-t p-4 bg-gray-100 text-center">
            <p className="text-gray-600 text-sm">
              Los administradores solo pueden visualizar conversaciones
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
