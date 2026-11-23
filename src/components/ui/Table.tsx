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
  filtrable?: boolean;
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
  filtrable = true,
}: TableProps<T>) {
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortAsc, setSortAsc] = React.useState(true);
  const [filtro, setFiltro] = React.useState("");

  const normalizar = (texto: string) =>
    texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const filasFiltradas = React.useMemo(() => {
    const termino = normalizar(filtro.trim());

    if (!termino) return data;

    const palabras = termino.split(/\s+/).filter(Boolean);

    return data.filter((item) => {
      const contenido = normalizar(
        columns
          .map((column) => {
            const valor = (item as Record<string, unknown>)[column.key];
            return valor === null || valor === undefined ? "" : String(valor);
          })
          .join(" "),
      );

      return palabras.every((palabra) => contenido.includes(palabra));
    });
  }, [data, columns, filtro]);

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
    if (!sortKey) return filasFiltradas;

    const copia = [...filasFiltradas];
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
  }, [filasFiltradas, sortKey, sortAsc]);

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
        <p className="text-gray-600 font-medium">No se encontraron registros</p>
        <p className="text-sm text-gray-500 mt-1">
          Ajusta la búsqueda o los filtros e inténtalo de nuevo.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {filtrable && (
        <div className="px-6 pt-4 pb-2">
          <input
            type="text"
            value={filtro}
            onChange={(evento) => setFiltro(evento.target.value)}
            placeholder="Filtrar en la tabla..."
            aria-label="Filtrar registros de la tabla"
            className="w-full md:w-72 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
      <table className="block w-full md:table md:min-w-full md:divide-y md:divide-gray-200">
        <thead className="hidden bg-gray-50 md:table-header-group">
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
        <tbody className="block bg-transparent md:table-row-group md:bg-white md:divide-y md:divide-gray-200">
          {filasOrdenadas.length === 0 && (
            <tr className="block md:table-row">
              <td
                colSpan={
                  columns.length +
                  (onEdit || onDelete || onView || extraActions ? 1 : 0)
                }
                className="block px-3 py-8 text-center text-sm text-gray-500 md:table-cell md:px-6"
              >
                No hay filas que coincidan con el filtro.
              </td>
            </tr>
          )}
          {filasOrdenadas.map((item, index) => (
            <tr
              key={item.uniqueId || item.id || index}
              className="mb-3 block rounded-xl border border-gray-200 bg-white p-3 shadow-sm md:mb-0 md:table-row md:rounded-none md:border-0 md:p-0 md:shadow-none hover:bg-gray-50"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="flex items-start justify-between gap-3 border-b border-gray-100 py-2 text-sm text-gray-900 last:border-0 md:table-cell md:border-0 md:px-6 md:py-4 md:whitespace-nowrap"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 md:hidden">
                    {column.label}
                  </span>
                  <div className="text-right md:text-left">
                    {column.render
                      ? column.render(
                          (item as Record<string, unknown>)[column.key],
                          item,
                        )
                      : String(
                          (item as Record<string, unknown>)[column.key] ?? "",
                        )}
                  </div>
                </td>
              ))}
              {(onEdit || onDelete || onView || extraActions) && (
                <td className="flex flex-wrap items-center justify-end gap-2 pt-3 md:table-cell md:px-6 md:py-4 md:pt-4 md:text-right md:whitespace-nowrap text-sm font-medium">
                  <div className="flex flex-wrap justify-end gap-2">
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
