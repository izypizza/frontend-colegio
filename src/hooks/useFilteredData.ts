import { useState, useMemo } from "react";

/**
 * Hook para filtrado de datos con búsqueda por texto
 * Reemplaza el código duplicado en 15+ páginas
 */
export function useFilteredData<T>(
  data: T[],
  searchFields: (keyof T)[],
  additionalFilters?: Record<string, any>,
) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    return data.filter((item) => {
      // Búsqueda por texto en los campos especificados
      const matchesSearch =
        searchTerm === "" ||
        searchFields.some((field) => {
          const value = item[field];
          if (value == null) return false;
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        });

      // Filtros adicionales (exactos)
      const matchesFilters =
        !additionalFilters ||
        Object.entries(additionalFilters).every(([key, value]) => {
          if (value === null || value === undefined || value === "")
            return true;
          return item[key as keyof T] === value;
        });

      return matchesSearch && matchesFilters;
    });
  }, [data, searchTerm, searchFields, additionalFilters]);

  return {
    filteredData,
    searchTerm,
    setSearchTerm,
  };
}
