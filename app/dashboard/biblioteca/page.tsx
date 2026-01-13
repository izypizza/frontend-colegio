"use client";

import { useState, useEffect } from "react";
import { libroService, categoriaLibroService } from "@/src/lib/services";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Card } from "@/src/components/ui/Card";
import { Modal } from "@/src/components/ui/Modal";
import { Table } from "@/src/components/ui/Table";
import { Alert } from "@/src/components/ui/Alert";

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
  const [libros, setLibros] = useState<Libro[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estados para el modal
  const [showModal, setShowModal] = useState(false);
  const [editingLibro, setEditingLibro] = useState<Libro | null>(null);

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

  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("");
  const [filterDisponible, setFilterDisponible] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [librosData, categoriasData] = await Promise.all([
        libroService.getAll(),
        categoriaLibroService.getAll(),
      ]);
      setLibros(Array.isArray(librosData) ? librosData : []);
      setCategorias(Array.isArray(categoriasData) ? categoriasData : []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Error al cargar los datos");
    } finally {
      setLoading(false);
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

    const matchDisponible =
      filterDisponible === "" ||
      (filterDisponible === "true" && libro.disponible) ||
      (filterDisponible === "false" && !libro.disponible);

    return matchSearch && matchCategoria && matchDisponible;
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
          {libro.tipo === "fisico" ? "📚 Físico" : "💻 Digital"}
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
            ♾️ Ilimitado
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
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Libros</h1>
        <Button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          + Nuevo Libro
        </Button>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Buscar por título o autor"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar..."
          />

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
      </Card>

      {/* Tabla de libros */}
      <Card>
        <Table
          columns={columns}
          data={filteredLibros}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

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
              <option value="fisico">📚 Físico</option>
              <option value="digital">💻 Digital</option>
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
