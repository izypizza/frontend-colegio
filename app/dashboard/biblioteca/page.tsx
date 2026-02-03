"use client";

import { useState, useEffect } from "react";
import { libroService, categoriaLibroService } from "@/src/lib/services";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Card } from "@/src/components/ui/Card";
import { Modal } from "@/src/components/ui/Modal";
import { Table } from "@/src/components/ui/Table";
import { Alert } from "@/src/components/ui/Alert";
import { useAuth } from "@/src/features/auth";
import { Pagination } from "@/src/components/ui/Pagination";

interface Libro {
  id: number;
  titulo: string;
  tipo: "fisico" | "digital";
  autor: string;
  isbn?: string;
  editorial?: string;
  anio_publicacion?: number;
  cantidad_total: number;
  cantidad_disponible: number;
  categoria_id: number;
  categoria?: { id: number; nombre: string };
  disponible: boolean;
  url_digital?: string;
  formato_digital?: string;
}

interface Categoria {
  id: number;
  nombre: string;
}

export default function LibrosPage() {
  const { user } = useAuth();
  const [libros, setLibros] = useState<Libro[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Estados para el modal
  const [showModal, setShowModal] = useState(false);
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [editingLibro, setEditingLibro] = useState<Libro | null>(null);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(50);
  const [paginationData, setPaginationData] = useState({
    total: 0,
    lastPage: 1,
  });

  // Estados para el formulario
  const [formData, setFormData] = useState({
    titulo: "",
    tipo: "fisico" as "fisico" | "digital",
    autor: "",
    isbn: "",
    editorial: "",
    anio_publicacion: "",
    cantidad_total: "1",
    categoria_id: "",
    disponible: true,
    url_digital: "",
    formato_digital: "",
  });

  // Formulario de categoría
  const [categoriaForm, setCategoriaForm] = useState({
    nombre: "",
  });

  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [filterDisponible, setFilterDisponible] = useState("");

  useEffect(() => {
    loadData();
  }, [currentPage, perPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [librosData, categoriasData] = await Promise.all([
        libroService.getAll({ page: currentPage, per_page: perPage }),
        categoriaLibroService.getAll({ all: true }),
      ]);

      // Manejar respuesta paginada
      if (
        librosData &&
        typeof librosData === "object" &&
        "data" in librosData &&
        "current_page" in librosData
      ) {
        setLibros(librosData.data);
        setPaginationData({
          total: librosData.total || 0,
          lastPage: librosData.last_page || 1,
        });
      } else {
        const librosArray = Array.isArray(librosData)
          ? librosData
          : librosData?.data || [];
        setLibros(librosArray);
      }

      setCategorias(
        Array.isArray(categoriasData)
          ? categoriasData
          : categoriasData?.data || [],
      );
      setError(null);
    } catch (err: any) {
      setError(err.message || "Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoriaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await categoriaLibroService.create(categoriaForm);
      setSuccess("Categoría creada exitosamente");
      setShowCategoriaModal(false);
      setCategoriaForm({ nombre: "" });
      loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Error al crear categoría");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        titulo: formData.titulo,
        tipo: formData.tipo,
        autor: formData.autor,
        isbn: formData.tipo === "fisico" ? formData.isbn || null : null,
        editorial:
          formData.tipo === "fisico" ? formData.editorial || null : null,
        anio_publicacion: formData.anio_publicacion
          ? Number(formData.anio_publicacion)
          : null,
        cantidad_total:
          formData.tipo === "fisico" ? Number(formData.cantidad_total) : 999,
        categoria_id: Number(formData.categoria_id),
        disponible: formData.disponible,
        url_digital:
          formData.tipo === "digital" ? formData.url_digital || null : null,
        formato_digital:
          formData.tipo === "digital" ? formData.formato_digital || null : null,
      };

      if (editingLibro) {
        await libroService.update(editingLibro.id, data);
        setSuccess("Libro actualizado exitosamente");
      } else {
        await libroService.create(data);
        setSuccess("Libro creado exitosamente");
      }

      setShowModal(false);
      resetForm();
      loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Error al guardar el libro");
    }
  };

  const handleEdit = (libro: Libro) => {
    setEditingLibro(libro);
    setFormData({
      titulo: libro.titulo,
      tipo: libro.tipo || "fisico",
      autor: libro.autor,
      isbn: libro.isbn || "",
      editorial: libro.editorial || "",
      anio_publicacion: libro.anio_publicacion?.toString() || "",
      cantidad_total: libro.cantidad_total.toString(),
      categoria_id: libro.categoria_id.toString(),
      disponible: libro.disponible,
      url_digital: libro.url_digital || "",
      formato_digital: libro.formato_digital || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar este libro?")) return;

    try {
      await libroService.delete(id);
      setSuccess("Libro eliminado exitosamente");
      loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Error al eliminar el libro");
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: "",
      tipo: "fisico",
      autor: "",
      isbn: "",
      editorial: "",
      anio_publicacion: "",
      cantidad_total: "1",
      categoria_id: "",
      disponible: true,
      url_digital: "",
      formato_digital: "",
    });
    setEditingLibro(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  // Filtrar libros
  const filteredLibros = libros.filter((libro) => {
    const matchSearch =
      libro.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      libro.autor.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCategoria =
      filterCategoria === "" ||
      libro.categoria_id.toString() === filterCategoria;

    const matchTipo = filterTipo === "" || libro.tipo === filterTipo;

    const matchDisponible =
      filterDisponible === "" ||
      (filterDisponible === "true" && libro.disponible) ||
      (filterDisponible === "false" && !libro.disponible);

    return matchSearch && matchCategoria && matchTipo && matchDisponible;
  });

  const columns = [
    { key: "titulo", label: "Título" },
    {
      key: "tipo",
      label: "Tipo",
      render: (libro: Libro) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            libro.tipo === "fisico"
              ? "bg-blue-100 text-blue-800"
              : "bg-purple-100 text-purple-800"
          }`}
        >
          {libro.tipo === "fisico" ? "Físico" : "Digital"}
        </span>
      ),
    },
    { key: "autor", label: "Autor" },
    {
      key: "categoria",
      label: "Categoría",
      render: (libro: Libro) => libro.categoria?.nombre || "-",
    },
    {
      key: "disponible",
      label: "Estado",
      render: (libro: Libro) =>
        libro.tipo === "digital" ? (
          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
            Ilimitado
          </span>
        ) : (
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              libro.cantidad_disponible > 0
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {libro.cantidad_disponible} / {libro.cantidad_total} disponible
            {libro.cantidad_disponible !== 1 ? "s" : ""}
          </span>
        ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Biblioteca</h1>
          <p className="text-gray-600 mt-1">
            Gestión de libros y recursos digitales
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCategoriaModal(true)}>
            Categorías
          </Button>
          <Button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            + Nuevo Libro
          </Button>
        </div>
      </div>

      {/* Resumen de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-600">Total Libros</p>
            <p className="text-2xl font-bold text-blue-600">{libros.length}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-600">Físicos</p>
            <p className="text-2xl font-bold text-green-600">
              {libros.filter((l) => l.tipo === "fisico").length}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-600">Digitales</p>
            <p className="text-2xl font-bold text-purple-600">
              {libros.filter((l) => l.tipo === "digital").length}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-600">Categorías</p>
            <p className="text-2xl font-bold text-orange-600">
              {categorias.length}
            </p>
          </div>
        </Card>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}
      {success && (
        <Alert
          type="success"
          message={success}
          onClose={() => setSuccess(null)}
        />
      )}

      {/* Filtros */}
      <Card>
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded ${
                  viewMode === "grid"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
                title="Vista de tarjetas"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded ${
                  viewMode === "table"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
                title="Vista de tabla"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Buscar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Título o autor..."
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Todos</option>
                <option value="fisico">Físicos</option>
                <option value="digital">Digitales</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Todas las categorías</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Disponibilidad
              </label>
              <select
                value={filterDisponible}
                onChange={(e) => setFilterDisponible(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Todos</option>
                <option value="true">Disponibles</option>
                <option value="false">Prestados</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Vista de contenido */}
      {viewMode === "table" ? (
        <Card>
          <Table
            columns={columns}
            data={filteredLibros}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredLibros.map((libro) => (
            <Card key={libro.id}>
              <div className="p-4 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      libro.tipo === "fisico"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {libro.tipo === "fisico" ? "Físico" : "Digital"}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      libro.tipo === "digital" || libro.cantidad_disponible > 0
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {libro.tipo === "digital"
                      ? "∞ Ilimitado"
                      : `${libro.cantidad_disponible} disp.`}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">
                  {libro.titulo}
                </h3>
                <p className="text-sm text-gray-600 mb-2">Por {libro.autor}</p>
                <p className="text-xs text-gray-500 mb-3">
                  {libro.categoria?.nombre || "Sin categoría"}
                </p>
                {libro.isbn && (
                  <p className="text-xs text-gray-400 mb-3">
                    ISBN: {libro.isbn}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleEdit(libro)}
                    className="flex-1 text-sm"
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDelete(libro.id)}
                    className="flex-1 text-sm text-red-600 hover:bg-red-50"
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {filteredLibros.length === 0 && (
        <Card>
          <div className="p-8 text-center text-gray-500">
            No se encontraron libros con los filtros seleccionados
          </div>
        </Card>
      )}

      {/* Modal de Categoría */}
      <Modal
        isOpen={showCategoriaModal}
        onClose={() => {
          setShowCategoriaModal(false);
          setCategoriaForm({ nombre: "" });
        }}
        title="Nueva Categoría"
      >
        <form onSubmit={handleCategoriaSubmit} className="space-y-4">
          <Input
            label="Nombre de la categoría *"
            value={categoriaForm.nombre}
            onChange={(e) => setCategoriaForm({ nombre: e.target.value })}
            required
          />
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCategoriaModal(false);
                setCategoriaForm({ nombre: "" });
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">Crear Categoría</Button>
          </div>
        </form>

        {categorias.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              Categorías existentes:
            </h3>
            <div className="space-y-1">
              {categorias.map((cat) => (
                <div
                  key={cat.id}
                  className="px-3 py-2 bg-gray-50 rounded text-sm"
                >
                  {cat.nombre}
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de formulario */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingLibro ? "Editar Libro" : "Nuevo Libro"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Título *"
            value={formData.titulo}
            onChange={(e) =>
              setFormData({ ...formData, titulo: e.target.value })
            }
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Libro *
            </label>
            <select
              value={formData.tipo}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tipo: e.target.value as "fisico" | "digital",
                })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            >
              <option value="fisico">Físico</option>
              <option value="digital">Digital</option>
            </select>
          </div>

          <Input
            label="Autor *"
            value={formData.autor}
            onChange={(e) =>
              setFormData({ ...formData, autor: e.target.value })
            }
            required
          />

          {/* Campos solo para libros físicos */}
          {formData.tipo === "fisico" && (
            <>
              <Input
                label="ISBN (opcional)"
                value={formData.isbn}
                onChange={(e) =>
                  setFormData({ ...formData, isbn: e.target.value })
                }
                placeholder="Ej: 978-3-16-148410-0"
              />

              <Input
                label="Editorial (opcional)"
                value={formData.editorial}
                onChange={(e) =>
                  setFormData({ ...formData, editorial: e.target.value })
                }
                placeholder="Ej: Santillana"
              />

              <Input
                label="Cantidad Total *"
                type="number"
                min="1"
                value={formData.cantidad_total}
                onChange={(e) =>
                  setFormData({ ...formData, cantidad_total: e.target.value })
                }
                required
              />
            </>
          )}

          {/* Campos solo para libros digitales */}
          {formData.tipo === "digital" && (
            <>
              <Input
                label="URL / Enlace (opcional)"
                value={formData.url_digital}
                onChange={(e) =>
                  setFormData({ ...formData, url_digital: e.target.value })
                }
                placeholder="https://..."
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Formato Digital (opcional)
                </label>
                <select
                  value={formData.formato_digital}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      formato_digital: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Seleccionar formato</option>
                  <option value="PDF">PDF</option>
                  <option value="EPUB">EPUB</option>
                  <option value="MOBI">MOBI</option>
                  <option value="AZW">AZW (Kindle)</option>
                  <option value="Online">Online / Web</option>
                </select>
              </div>
            </>
          )}

          <Input
            label="Año de Publicación (opcional)"
            type="number"
            min="1900"
            max={new Date().getFullYear()}
            value={formData.anio_publicacion}
            onChange={(e) =>
              setFormData({ ...formData, anio_publicacion: e.target.value })
            }
            placeholder="Ej: 2024"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría *
            </label>
            <select
              value={formData.categoria_id}
              onChange={(e) =>
                setFormData({ ...formData, categoria_id: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            >
              <option value="">Seleccionar categoría</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="disponible"
              checked={formData.disponible}
              onChange={(e) =>
                setFormData({ ...formData, disponible: e.target.checked })
              }
              className="mr-2"
            />
            <label
              htmlFor="disponible"
              className="text-sm font-medium text-gray-700"
            >
              Disponible{" "}
              {formData.tipo === "digital" &&
                "(siempre disponible para digitales)"}
            </label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModal}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {editingLibro ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
