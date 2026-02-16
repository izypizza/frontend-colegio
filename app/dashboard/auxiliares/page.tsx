"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/src/features/auth";
import { useErrorHandler } from "@/src/hooks/useErrorHandler";
import { useModalState } from "@/src/hooks/useModalState";
import { usePagination } from "@/src/hooks/usePagination";
import { userManagementService } from "@/src/lib/services";
import { User } from "@/src/types/models";
import {
  Alert,
  Button,
  Card,
  Input,
  Modal,
  Pagination,
  Table,
} from "@/src/components/ui";

const ROLE = "auxiliar";

export default function AuxiliaresPage() {
  const { user } = useAuth();
  const { error, success, setError, setSuccess, handleError } =
    useErrorHandler();
  const {
    isOpen: isCreateOpen,
    open: openCreate,
    close: closeCreate,
  } = useModalState();
  const {
    isOpen: isEditOpen,
    open: openEdit,
    close: closeEdit,
  } = useModalState();
  const {
    currentPage,
    perPage,
    setCurrentPage,
    setPerPage,
    setPaginationData,
    paginationData,
  } = usePagination(20);

  const [items, setItems] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    is_active: true,
  });
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, [currentPage, perPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await userManagementService.getAll({
        page: currentPage,
        per_page: perPage,
      });
      const usersArray = (
        Array.isArray(data) ? data : (data as any)?.data || []
      ) as User[];
      setItems(usersArray.filter((u: User) => u.role === ROLE));
      if (data && typeof data === "object" && "last_page" in (data as any)) {
        setPaginationData({
          total: (data as any).total || 0,
          lastPage: (data as any).last_page || 1,
        });
      }
    } catch (err: any) {
      handleError(err, "Error al cargar auxiliares");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!createForm.name || !createForm.email || !createForm.password) {
      setError("Nombre, email y contraseña son requeridos");
      return;
    }
    try {
      await userManagementService.create({
        name: createForm.name,
        email: createForm.email,
        password: createForm.password,
        role: ROLE,
        is_active: createForm.is_active,
      });
      setSuccess("Auxiliar creado");
      closeCreate();
      setCreateForm({ name: "", email: "", password: "", is_active: true });
      await fetchData();
    } catch (err: any) {
      handleError(err, "Error al crear auxiliar");
    }
  };

  const handleEdit = (u: User) => {
    setEditingUser(u);
    setEditForm({ name: u.name, email: u.email, password: "" });
    openEdit();
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    try {
      const payload: any = { name: editForm.name, email: editForm.email };
      if (editForm.password) payload.password = editForm.password;
      await userManagementService.update(editingUser.id, payload);
      setSuccess("Auxiliar actualizado");
      closeEdit();
      setEditingUser(null);
      await fetchData();
    } catch (err: any) {
      handleError(err, "Error al actualizar auxiliar");
    }
  };

  const handleToggle = async (u: User) => {
    if (!confirm(`¿${u.is_active ? "Desactivar" : "Activar"} este usuario?`))
      return;
    try {
      await userManagementService.toggleActive(u.id);
      setSuccess("Estado actualizado");
      await fetchData();
    } catch (err: any) {
      handleError(err, "Error al cambiar estado");
    }
  };

  const filtered = useMemo(() => {
    return items.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()),
    );
  }, [items, search]);

  if (!user) {
    return (
      <div className="p-6">
        <Alert type="warning" message="Cargando usuario..." />
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="p-6">
        <Alert
          type="error"
          message="Solo administradores pueden gestionar auxiliares."
        />
      </div>
    );
  }

  const columns = [
    {
      key: "name",
      label: "Nombre",
      render: (_: unknown, u: User) => (
        <div>
          <div className="font-medium">{u.name}</div>
          <div className="text-sm text-gray-500">{u.email}</div>
        </div>
      ),
    },
    {
      key: "is_active",
      label: "Estado",
      render: (_: unknown, u: User) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${u.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          {u.is_active ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      key: "acciones",
      label: "Acciones",
      render: (_: unknown, u: User) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleEdit(u)}>
            Editar
          </Button>
          <Button
            variant={u.is_active ? "danger" : "success"}
            size="sm"
            onClick={() => handleToggle(u)}
          >
            {u.is_active ? "Desactivar" : "Activar"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Auxiliares</h1>
          <p className="text-gray-600">Gestiona cuentas de auxiliares</p>
        </div>
        <Button onClick={openCreate}>Nuevo auxiliar</Button>
      </div>

      {error && (
        <Alert
          type="error"
          message={error}
          className="mb-4"
          onClose={() => setError(null)}
        />
      )}
      {success && (
        <Alert
          type="success"
          message={success}
          className="mb-4"
          onClose={() => setSuccess(null)}
        />
      )}

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Buscar por nombre o email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-4 text-gray-600">Cargando...</p>
          </div>
        ) : (
          <Table columns={columns} data={filtered} />
        )}
      </Card>

      <Pagination
        currentPage={currentPage}
        lastPage={paginationData.lastPage}
        total={paginationData.total}
        perPage={perPage}
        onPageChange={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onPerPageChange={(newPerPage) => {
          setPerPage(newPerPage);
          setCurrentPage(1);
        }}
      />

      <Modal isOpen={isCreateOpen} onClose={closeCreate} title="Nuevo auxiliar">
        <div className="space-y-4">
          <Input
            label="Nombre"
            value={createForm.name}
            onChange={(e) =>
              setCreateForm({ ...createForm, name: e.target.value })
            }
          />
          <Input
            label="Email"
            value={createForm.email}
            onChange={(e) =>
              setCreateForm({ ...createForm, email: e.target.value })
            }
          />
          <Input
            label="Contraseña"
            type="password"
            value={createForm.password}
            onChange={(e) =>
              setCreateForm({ ...createForm, password: e.target.value })
            }
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="create_active_aux"
              checked={createForm.is_active}
              onChange={(e) =>
                setCreateForm({ ...createForm, is_active: e.target.checked })
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="create_active_aux"
              className="text-sm text-gray-700"
            >
              Usuario activo
            </label>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="secondary" onClick={closeCreate}>
              Cancelar
            </Button>
            <Button onClick={handleCreate}>Crear</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={closeEdit} title="Editar auxiliar">
        <div className="space-y-4">
          <Input
            label="Nombre"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          />
          <Input
            label="Email"
            value={editForm.email}
            onChange={(e) =>
              setEditForm({ ...editForm, email: e.target.value })
            }
          />
          <Input
            label="Nueva contraseña (opcional)"
            type="password"
            value={editForm.password}
            onChange={(e) =>
              setEditForm({ ...editForm, password: e.target.value })
            }
          />
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="secondary" onClick={closeEdit}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate}>Guardar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
