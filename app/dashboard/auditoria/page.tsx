"use client";

import { useEffect, useState } from "react";
import { Card } from "@/src/components/ui/Card";
import { apiClient } from "@/src/lib/api-client";

interface AuditLog {
  id: number;
  user_id: number;
  accion: string;
  modelo: string;
  modelo_id?: number;
  datos_anteriores?: Record<string, any>;
  datos_nuevos?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  user?: {
    name: string;
    email: string;
  };
}

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{ data: AuditLog[] }>("/auditoria", {
        params: { page },
      });
      setLogs(response.data);
    } catch (error) {
      console.error("Error al cargar auditoría:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAccionColor = (accion: string) => {
    switch (accion) {
      case "create":
      case "POST":
        return "bg-green-100 text-green-800 border-green-200";
      case "update":
      case "PUT":
      case "PATCH":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "delete":
      case "DELETE":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getAccionLabel = (accion: string) => {
    const labels: Record<string, string> = {
      create: "Crear",
      POST: "Crear",
      update: "Actualizar",
      PUT: "Actualizar",
      PATCH: "Modificar",
      delete: "Eliminar",
      DELETE: "Eliminar",
    };
    return labels[accion] || accion;
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#04ADBF]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Auditoría del Sistema
        </h1>
        <p className="text-gray-600 mt-2">
          Registro completo de todas las acciones realizadas en el sistema
        </p>
      </div>

      {logs.length === 0 ? (
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="mt-4 text-gray-500">No hay registros de auditoría</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <Card key={log.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded text-sm font-medium ${getAccionColor(
                      log.accion,
                    )}`}
                  >
                    {getAccionLabel(log.accion)}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {log.modelo}
                      {log.modelo_id && ` #${log.modelo_id}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {log.user?.name || "Usuario desconocido"} (
                      {log.user?.email})
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(log.created_at).toLocaleString("es-PE")}
                </p>
              </div>

              {(log.datos_anteriores || log.datos_nuevos) && (
                <div className="mt-3 pt-3 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {log.datos_anteriores && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Datos Anteriores:
                        </h4>
                        <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.datos_anteriores, null, 2)}
                        </pre>
                      </div>
                    )}
                    {log.datos_nuevos && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Datos Nuevos:
                        </h4>
                        <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.datos_nuevos, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(log.ip_address || log.user_agent) && (
                <div className="mt-2 pt-2 border-t text-xs text-gray-500">
                  {log.ip_address && <p>IP: {log.ip_address}</p>}
                  {log.user_agent && (
                    <p className="truncate">User Agent: {log.user_agent}</p>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
