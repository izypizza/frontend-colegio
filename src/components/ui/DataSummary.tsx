import React from "react";

interface DataSummaryProps {
  total: number;
  filtered: number;
  currentPage?: number;
  perPage?: number;
  lastPage?: number;
  title?: string;
}

/**
 * Barra compacta de resumen para tablas con paginación y filtros.
 * Muestra totales, filtrados y rango visible con una barra de progreso.
 */
export const DataSummary: React.FC<DataSummaryProps> = ({
  total,
  filtered,
  currentPage = 1,
  perPage = 10,
  lastPage = 1,
  title = "Resumen",
}) => {
  const safeTotal = Math.max(total || 0, 0);
  const safeFiltered = Math.max(filtered || 0, 0);

  const startItem = safeTotal > 0 ? (currentPage - 1) * perPage + 1 : 0;
  const endItem =
    safeTotal > 0 ? Math.min(currentPage * perPage, safeTotal) : 0;
  const filteredPercent =
    safeTotal > 0 ? Math.min(100, (safeFiltered / safeTotal) * 100) : 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="text-xs uppercase tracking-wide text-gray-500">
          {title}
        </div>
        <div className="mt-2 flex items-end gap-2">
          <div className="text-3xl font-bold text-gray-900">{safeTotal}</div>
          <span className="text-sm text-gray-500">registros totales</span>
        </div>
        <div className="mt-3 h-2 rounded-full bg-gray-100">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
            style={{ width: `${filteredPercent}%` }}
          />
        </div>
        <div className="mt-1 text-xs text-gray-500">
          {safeFiltered} visibles con filtros activos
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="text-xs uppercase tracking-wide text-gray-500">
          Página
        </div>
        <div className="mt-2 flex items-baseline gap-2 text-gray-900">
          <span className="text-2xl font-semibold">{currentPage}</span>
          <span className="text-sm text-gray-500">
            de {Math.max(lastPage, 1)}
          </span>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          Mostrando {startItem || 0} - {endItem || 0}
        </div>
        <div className="mt-1 text-xs text-gray-500">{perPage} por página</div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="text-xs uppercase tracking-wide text-gray-500">
          Detalle
        </div>
        <div className="mt-2 text-sm text-gray-700">
          • En pantalla: <span className="font-semibold">{safeFiltered}</span>
        </div>
        <div className="text-sm text-gray-700">
          • Total cargado: <span className="font-semibold">{safeTotal}</span>
        </div>
        <div className="mt-3 flex gap-2 text-xs text-gray-500">
          <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-700">
            Tabla interactiva
          </span>
          <span className="rounded-full bg-indigo-50 px-2 py-1 text-indigo-700">
            Paginación
          </span>
        </div>
      </div>
    </div>
  );
};
