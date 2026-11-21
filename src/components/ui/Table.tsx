"use client";

import React from "react";
import { Button } from "./Button";

interface Column<T> {
  key: string;
  label: string;
  render?: (value: unknown, item: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  extraActions?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

export function Table<T extends { id: string | number; uniqueId?: string }>({
  columns,
  data,
  loading = false,
  onEdit,
  onDelete,
  onView,
  extraActions,
  sortable = true,
}: TableProps<T>) {
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortAsc, setSortAsc] = React.useState(true);

  const alternarOrden = (key: string) => {
    if (!sortable) return;

    if (sortKey !== key) {
      setSortKey(key);
      setSortAsc(true);
      return;
    }

    if (sortAsc) {
      setSortAsc(false);
      return;
    }

    setSortKey(null);
    setSortAsc(true);
  };

  const filasOrdenadas = React.useMemo(() => {
    if (!sortKey) return data;

    const copia = [...data];
    copia.sort((a, b) => {
      const valorA = (a as Record<string, unknown>)[sortKey];
      const valorB = (b as Record<string, unknown>)[sortKey];

      if (valorA === null || valorA === undefined) return 1;
      if (valorB === null || valorB === undefined) return -1;

      if (typeof valorA === "number" && typeof valorB === "number") {
        return sortAsc ? valorA - valorB : valorB - valorA;
      }

      const comparacion = String(valorA).localeCompare(String(valorB), "es", {
        numeric: true,
        sensitivity: "base",
      });

      return sortAsc ? comparacion : -comparacion;
    });

    return copia;
  }, [data, sortKey, sortAsc]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 font-medium">
          No se encontraron registros
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Ajusta la búsqueda o los filtros e inténtalo de nuevo.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                aria-sort={
                  sortKey === column.key
                    ? sortAsc
                      ? "ascending"
                      : "descending"
                    : "none"
                }
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {sortable ? (
                  <button
                    type="button"
                    onClick={() => alternarOrden(column.key)}
                    className="inline-flex items-center gap-1 uppercase tracking-wider hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  >
                    <span>{column.label}</span>
                    <span aria-hidden="true" className="text-[10px]">
                      {sortKey === column.key ? (sortAsc ? "▲" : "▼") : "↕"}
                    </span>
                  </button>
                ) : (
                  column.label
                )}
              </th>
            ))}
            {(onEdit || onDelete || onView || extraActions) && (
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filasOrdenadas.map((item, index) => (
            <tr
              key={item.uniqueId || item.id || index}
              className="hover:bg-gray-50"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {column.render
                    ? column.render(
                        (item as Record<string, unknown>)[column.key],
                        item,
                      )
                    : String(
                        (item as Record<string, unknown>)[column.key] ?? "",
                      )}
                </td>
              ))}
              {(onEdit || onDelete || onView || extraActions) && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    {onView && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onView(item)}
                      >
                        Ver
                      </Button>
                    )}
                    {onEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(item)}
                      >
                        Editar
                      </Button>
                    )}
                    {extraActions?.(item)}
                    {onDelete && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => onDelete(item)}
                      >
                        Eliminar
                      </Button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
