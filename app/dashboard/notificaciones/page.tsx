"use client";

import { useEffect, useState } from "react";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { notificacionService } from "@/src/lib/services";
import { Notificacion } from "@/src/types/models";

export default function NotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"todas" | "no_leidas">("todas");

  useEffect(() => {
    fetchNotificaciones();
  }, [filter]);

  const fetchNotificaciones = async () => {
    try {
      setLoading(true);
      const params = filter === "no_leidas" ? { no_leidas: true } : {};
      const response: any = await notificacionService.getAll(params);
      setNotificaciones(response.data);
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  const marcarLeida = async (id: number) => {
    try {
      await notificacionService.marcarLeida(id);
      fetchNotificaciones();
    } catch (error) {
      console.error("Error al marcar notificación:", error);
    }
  };

  const marcarTodasLeidas = async () => {
    try {
      await notificacionService.marcarTodasLeidas();
      fetchNotificaciones();
    } catch (error) {
      console.error("Error al marcar todas:", error);
    }
  };

  const getTipoColor = (tipo?: string) => {
    switch (tipo) {
      case "info":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      case "success":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#04ADBF]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Notificaciones</h1>
        <Button onClick={marcarTodasLeidas} variant="secondary">
          Marcar todas como leídas
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => setFilter("todas")}
          variant={filter === "todas" ? "primary" : "secondary"}
        >
          Todas
        </Button>
        <Button
          onClick={() => setFilter("no_leidas")}
          variant={filter === "no_leidas" ? "primary" : "secondary"}
        >
          No leídas
        </Button>
      </div>

      {notificaciones.length === 0 ? (
        <Card className="p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <p className="mt-4 text-gray-500">No hay notificaciones</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notificaciones.map((notif) => (
            <Card
              key={notif.id}
              className={`p-4 ${
                !notif.leido_at
                  ? "border-l-4 border-l-[#04ADBF] bg-blue-50"
                  : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {notif.titulo}
                    </h3>
                    {notif.tipo && (
                      <span
                        className={`text-xs px-2 py-1 rounded ${getTipoColor(
                          notif.tipo,
                        )}`}
                      >
                        {notif.tipo}
                      </span>
                    )}
                    {!notif.leido_at && (
                      <span className="flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-[#04ADBF] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#04ADBF]"></span>
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 mb-2">{notif.mensaje}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(notif.created_at).toLocaleString("es-PE")}
                  </p>
                </div>
                {!notif.leido_at && (
                  <Button
                    onClick={() => marcarLeida(notif.id)}
                    variant="secondary"
                    size="sm"
                  >
                    Marcar leída
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
