import { useState } from "react";

interface PaginationInfo {
  total?: number;
  totalItems?: number;
  lastPage?: number;
  totalPages?: number;
  currentPage?: number;
  perPage?: number;
}

/**
 * Hook para manejo de paginación
 * Reemplaza el código duplicado en 10+ páginas
 */
export function usePagination(initialPerPage: number = 50) {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(initialPerPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const updatePagination = (pagination: PaginationInfo) => {
    const nextTotal =
      pagination.totalItems ?? pagination.total ?? totalItems ?? 0;
    const nextLastPage =
      pagination.totalPages ?? pagination.lastPage ?? totalPages ?? 1;

    setTotalItems(nextTotal);
    setTotalPages(nextLastPage);

    if (pagination.perPage) {
      setPerPage(pagination.perPage);
    }

    if (pagination.currentPage) {
      setCurrentPage(pagination.currentPage);
    }
  };

  const reset = () => {
    setCurrentPage(1);
    setTotalPages(1);
    setTotalItems(0);
  };

  // Alias para compatibilidad con código existente
  const setPaginationData = (data: { total: number; lastPage: number }) => {
    updatePagination({ total: data.total, lastPage: data.lastPage });
  };

  const paginationData = {
    total: totalItems,
    lastPage: totalPages,
  };

  return {
    currentPage,
    perPage,
    totalPages,
    totalItems,
    setCurrentPage,
    setPerPage,
    goToPage,
    nextPage,
    prevPage,
    updatePagination,
    setPaginationData,
    paginationData,
    reset,
  };
}
