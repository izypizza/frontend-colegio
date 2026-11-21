"use client";

import { Alert, Button, Card, Input, Modal, Table } from "@/src/components/ui";
import { PermissionGuard } from "@/src/components/auth";
import { UserRole } from "@/src/types";
import { useAuth } from "@/src/features/auth";
import { useErrorHandler } from "@/src/hooks/useErrorHandler";
import { useModalState } from "@/src/hooks/useModalState";
import { usePermissions } from "@/src/hooks/usePermissions";
import { competenciaService, materiaService } from "@/src/lib/services";
import { Materia } from "@/src/types/models";
import { useEffect, useState } from "react";

const CICLOS = [
  { valor: "III", etiqueta: "III · 1.° y 2.° Primaria" },
  { valor: "IV", etiqueta: "IV · 3.° y 4.° Primaria" },
  { valor: "V", etiqueta: "V · 5.° y 6.° Primaria" },
  { valor: "VI", etiqueta: "VI · 1.° y 2.° Secundaria" },
  { valor: "VII", etiqueta: "VII · 3.°, 4.° y 5.° Secundaria" },
];

interface Competencia {
  id: number;
  materia_id: number;
  ciclo: string;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  orden: number;
  activo: boolean;
  materia?: { id: number; nombre: string };
}

const formularioVacio = {
  materia_id: "",
  ciclo: "",
  codigo: "",
  nombre: "",
  descripcion: "",
  orden: "1",
  activo: true,
};

export default function CompetenciasPage() {
  const { user } = useAuth();
  const permisos = usePermissions("competencias");
  const { error, success, setError, setSuccess, handleError } =
    useErrorHandler();
  const { isOpen, open, close } = useModalState();

  const [competencias, setCompetencias] = useState<Competencia[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState<Competencia | null>(null);
  const [filtroMateria, setFiltroMateria] = useState("");
  const [filtroCiclo, setFiltroCiclo] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [formulario, setFormulario] = useState({ ...formularioVacio });

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [respuestaCompetencias, respuestaMaterias] = await Promise.all([
        competenciaService.getAll({
          all: true,
          materia_id: filtroMateria ? parseInt(filtroMateria) : undefined,
          ciclo: filtroCiclo || undefined,
          buscar: busqueda.trim() || undefined,
        }),
        materiaService.getAll({ all: true }),
      ]);

      const lista = Array.isArray(respuestaCompetencias)
        ? respuestaCompetencias
        : respuestaCompetencias?.data || [];
      const listaMaterias = Array.isArray(respuestaMaterias)
        ? respuestaMaterias
        : respuestaMaterias?.data || [];

      setCompetencias(lista);
      setMaterias(listaMaterias);
    } catch (err) {
      handleError(err, "No se pudo cargar el catálogo de competencias");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const temporizador = setTimeout(cargarDatos, busqueda ? 400 : 0);
    return () => clearTimeout(temporizador);
  }, [filtroMateria, filtroCiclo, busqueda]);

  const abrirNueva = () => {
    setEditando(null);
    setFormulario({ ...formularioVacio });
    open();
  };

  const abrirEdicion = (competencia: Competencia) => {
    setEditando(competencia);
    setFormulario({
      materia_id: String(competencia.materia_id),
      ciclo: competencia.ciclo,
      codigo: competencia.codigo,
      nombre: competencia.nombre,
      descripcion: competencia.descripcion || "",
      orden: String(competencia.orden ?? 1),
      activo: competencia.activo,
    });
    open();
  };

  const guardar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (guardando) return;

    setGuardando(true);
    try {
      const datos = {
        materia_id: parseInt(formulario.materia_id),
        ciclo: formulario.ciclo,
        codigo: formulario.codigo.trim().toUpperCase(),
        nombre: formulario.nombre.trim(),
        descripcion: formulario.descripcion.trim() || null,
        orden: parseInt(formulario.orden || "1"),
        activo: formulario.activo,
      };

      if (editando) {
        await competenciaService.update(editando.id, datos);
        setSuccess("Competencia actualizada correctamente");
      } else {
        await competenciaService.create(datos);
        setSuccess("Competencia registrada correctamente");
      }

      close();
      setError(null);
      cargarDatos();
    } catch (err) {
      handleError(err, "No se pudo guardar la competencia");
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (competencia: Competencia) => {
    if (
      !confirm(
        `¿Eliminar la competencia "${competencia.nombre}" del ciclo ${competencia.ciclo}?`,
      )
    ) {
      return;
    }

    try {
      await competenciaService.delete(competencia.id);
      setSuccess("Competencia eliminada correctamente");
      cargarDatos();
    } catch (err) {
      handleError(err, "No se pudo eliminar la competencia");
    }
  };

  const columnas = [
    { key: "codigo", label: "Código" },
    {
      key: "nombre",
      label: "Competencia",
      render: (_valor: unknown, item: Competencia) => (
        <div>
          <div className="font-medium text-gray-900">{item.nombre}</div>
          <div className="text-xs text-gray-500">
            {(item.materia?.nombre || "Área") + " · Ciclo " + item.ciclo}
          </div>
        </div>
      ),
    },
    {
      key: "orden",
      label: "Orden",
      render: (valor: unknown) => (
        <span className="text-gray-700">{String(valor)}</span>
      ),
    },
    {
      key: "activo",
      label: "Estado",
      render: (valor: unknown) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            valor ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
          }`}
        >
          {valor ? "Activa" : "Inactiva"}
        </span>
      ),
    },
  ];

  if (user?.role !== UserRole.ADMIN && user?.role !== UserRole.AUXILIAR) {
    return (
      <div className="p-6">
        <Alert
          type="error"
          message="Solo administración puede gestionar el catálogo de competencias."
        />
      </div>
    );
  }

  return (
    <PermissionGuard
      requiredRoles={[UserRole.ADMIN, UserRole.AUXILIAR]}
      fallback={
        <div className="p-6">
          <Alert type="error" message="No tiene permisos para esta página." />
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Competencias del Currículo Nacional
            </h1>
            <p className="text-gray-600 mt-1">
              Cada área se evalúa por competencias y cada competencia conserva
              su propio nivel de logro.
            </p>
          </div>
          {permisos.canCreate && (
            <Button variant="primary" onClick={abrirNueva}>
              + Nueva competencia
            </Button>
          )}
        </div>

        {success && (
          <Alert
            type="success"
            message={success}
            onClose={() => setSuccess(null)}
          />
        )}

        <Card>
          <div className="flex flex-col md:flex-row gap-3">
            <Input
              placeholder="Buscar por nombre o código..."
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              className="flex-1"
            />
            <select
              value={filtroMateria}
              onChange={(evento) => setFiltroMateria(evento.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las áreas</option>
              {materias.map((materia) => (
                <option key={materia.id} value={materia.id}>
                  {materia.nombre}
                </option>
              ))}
            </select>
            <select
              value={filtroCiclo}
              onChange={(evento) => setFiltroCiclo(evento.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los ciclos</option>
              {CICLOS.map((ciclo) => (
                <option key={ciclo.valor} value={ciclo.valor}>
                  {ciclo.etiqueta}
                </option>
              ))}
            </select>
          </div>
        </Card>

        <Card>
          <Table
            columns={columnas as never}
            data={competencias}
            loading={cargando}
            onEdit={permisos.canEdit ? abrirEdicion : undefined}
            onDelete={permisos.canDelete ? eliminar : undefined}
          />
        </Card>

        <Modal
          isOpen={isOpen}
          onClose={() => {
            close();
            setError(null);
          }}
          title={editando ? "Editar competencia" : "Nueva competencia"}
          footer={
            <>
              <Button variant="secondary" onClick={close}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={guardar} disabled={guardando}>
                {guardando ? "Guardando..." : "Guardar"}
              </Button>
            </>
          }
        >
          <form onSubmit={guardar} className="space-y-4">
            {error && (
              <Alert
                type="error"
                message={error}
                onClose={() => setError(null)}
              />
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Área curricular
              </label>
              <select
                value={formulario.materia_id}
                onChange={(evento) =>
                  setFormulario({
                    ...formulario,
                    materia_id: evento.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar área</option>
                {materias.map((materia) => (
                  <option key={materia.id} value={materia.id}>
                    {materia.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ciclo
              </label>
              <select
                value={formulario.ciclo}
                onChange={(evento) =>
                  setFormulario({ ...formulario, ciclo: evento.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar ciclo</option>
                {CICLOS.map((ciclo) => (
                  <option key={ciclo.valor} value={ciclo.valor}>
                    {ciclo.etiqueta}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Código
                </label>
                <Input
                  value={formulario.codigo}
                  onChange={(evento) =>
                    setFormulario({
                      ...formulario,
                      codigo: evento.target.value.toUpperCase(),
                    })
                  }
                  placeholder="MATE-1"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Orden
                </label>
                <Input
                  type="number"
                  min="0"
                  max="99"
                  value={formulario.orden}
                  onChange={(evento) =>
                    setFormulario({ ...formulario, orden: evento.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre de la competencia
              </label>
              <Input
                value={formulario.nombre}
                onChange={(evento) =>
                  setFormulario({ ...formulario, nombre: evento.target.value })
                }
                placeholder="Resuelve problemas de cantidad"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Descripción (opcional)
              </label>
              <textarea
                value={formulario.descripcion}
                onChange={(evento) =>
                  setFormulario({
                    ...formulario,
                    descripcion: evento.target.value,
                  })
                }
                rows={3}
                maxLength={1000}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={formulario.activo}
                onChange={(evento) =>
                  setFormulario({
                    ...formulario,
                    activo: evento.target.checked,
                  })
                }
                className="h-4 w-4"
              />
              Competencia activa para calificar
            </label>
          </form>
        </Modal>
      </div>
    </PermissionGuard>
  );
}
