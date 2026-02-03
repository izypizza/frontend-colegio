"use client";

import { useEffect, useState } from "react";
import { Card } from "@/src/components/ui/Card";
import { apiClient } from "@/src/lib/api-client";
import Link from "next/link";

interface Estadisticas {
  total_conversaciones: number;
  conversaciones_activas: number;
  total_mensajes: number;
  mensajes_hoy: number;
  docentes_participantes: number;
  padres_participantes: number;
}

interface Conversacion {
  id: number;
  docente: { id: number; nombres: string; apellido_paterno: string };
  padre: { id: number; nombres: string; apellido_paterno: string };
  estudiante?: { id: number; nombres: string; apellido_paterno: string };
  ultimo_mensaje_at: string;
  mensajes_count: number;
  mensajes: Array<{ mensaje: string; created_at: string }>;
}

export default function ChatAdminPage() {
  const [stats, setStats] = useState<Estadisticas | null>(null);
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, conversacionesData] = await Promise.all([
        apiClient.get("/chat/estadisticas"),
        apiClient.get("/chat/todas"),
      ]);
      setStats(statsData as any);
      setConversaciones((conversacionesData as any).data || []);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const conversacionesFiltradas = conversaciones.filter((conv) => {
    const search = searchTerm.toLowerCase();
    return (
      conv.docente?.nombres?.toLowerCase().includes(search) ||
      conv.padre?.nombres?.toLowerCase().includes(search) ||
      conv.estudiante?.nombres?.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Monitoreo de Chat</h1>
        <p className="text-gray-600 mt-1">
          Supervisión de conversaciones Docente-Padre
        </p>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <div className="p-4">
              <p className="text-sm text-gray-600">Total Conversaciones</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.total_conversaciones}
              </p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <p className="text-sm text-gray-600">Activas (7 días)</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.conversaciones_activas}
              </p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <p className="text-sm text-gray-600">Total Mensajes</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.total_mensajes}
              </p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <p className="text-sm text-gray-600">Mensajes Hoy</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.mensajes_hoy}
              </p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <p className="text-sm text-gray-600">Docentes</p>
              <p className="text-2xl font-bold text-indigo-600">
                {stats.docentes_participantes}
              </p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <p className="text-sm text-gray-600">Padres</p>
              <p className="text-2xl font-bold text-pink-600">
                {stats.padres_participantes}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Búsqueda */}
      <Card>
        <div className="p-4">
          <input
            type="text"
            placeholder="Buscar por docente, padre o estudiante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </Card>

      {/* Lista de Conversaciones */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Todas las Conversaciones ({conversacionesFiltradas.length})
          </h2>
          <div className="space-y-3">
            {conversacionesFiltradas.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No se encontraron conversaciones
              </div>
            ) : (
              conversacionesFiltradas.map((conv) => (
                <Link
                  key={conv.id}
                  href={`/dashboard/chat/${conv.id}`}
                  className="block"
                >
                  <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                            {conv.docente?.nombres}{" "}
                            {conv.docente?.apellido_paterno}
                          </span>
                          <span className="text-gray-400">↔️</span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                            {conv.padre?.nombres} {conv.padre?.apellido_paterno}
                          </span>
                        </div>
                        {conv.estudiante && (
                          <p className="text-sm text-gray-600 mb-2">
                            Estudiante: {conv.estudiante.nombres}{" "}
                            {conv.estudiante.apellido_paterno}
                          </p>
                        )}
                        {conv.mensajes && conv.mensajes[0] && (
                          <p className="text-sm text-gray-500 italic truncate">
                            Último mensaje: "{conv.mensajes[0].mensaje}"
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{conv.mensajes_count} mensajes</span>
                          <span>
                            {" "}
                            {new Date(conv.ultimo_mensaje_at).toLocaleString(
                              "es-PE",
                              {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                        </div>
                      </div>
                      <div>
                        <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                          Ver Chat →
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
