import { useState } from 'react';

interface PaginationInfo {
  total: number;
  lastPage: number;
  currentPage?: number;
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
    setTotalItems(pagination.total || 0);
    setTotalPages(pagination.lastPage || 1);
    if (pagination.currentPage) {
      setCurrentPage(pagination.currentPage);
    }
  };

  const reset = () => {
    setCurrentPage(1);
    setTotalPages(1);
    setTotalItems(0);
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
    reset
  };
}
