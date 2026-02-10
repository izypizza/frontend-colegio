import { useState } from "react";

/**
 * Hook para manejo de estado de modales
 * Reemplaza el código duplicado en 15+ páginas
 */
export function useModalState<T = any>() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);

  const openCreate = () => {
    setEditingItem(null);
    setIsViewMode(false);
    setIsOpen(true);
  };

  const openEdit = (item: T) => {
    setEditingItem(item);
    setIsViewMode(false);
    setIsOpen(true);
  };

  const openView = (item: T) => {
    setEditingItem(item);
    setIsViewMode(true);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setEditingItem(null);
    setIsViewMode(false);
  };

  // Alias genérico para compatibilidad
  const open = () => {
    setIsViewMode(false);
    setIsOpen(true);
  };

  return {
    isOpen,
    editingItem,
    isViewMode,
    open,
    openCreate,
    openEdit,
    openView,
    close,
    setIsOpen,
    setEditingItem,
  };
}
