"use client";

import {
  Alert,
  Button,
  Card,
  Input,
  Modal,
  Table,
  Pagination,
} from "@/src/components/ui";
import { userManagementService } from "@/src/lib/services";
import { User, PersonaSinUsuario, CreateUserPayload } from "@/src/types/models";
import { useEffect, useState } from "react";
import { useAuth } from "@/src/features/auth";
import { useErrorHandler } from "@/src/hooks/useErrorHandler";
import { useModalState } from "@/src/hooks/useModalState";
import { usePagination } from "@/src/hooks/usePagination";

export default function UsuariosPage() {
  const { user } = useAuth();
  const { error, success, setError, setSuccess, handleError } =
    useErrorHandler();
  const {
    isOpen: isCreateModalOpen,
    open: openCreateModal,
    close: closeCreateModal,
  } = useModalState();
  const {
    isOpen: isEditModalOpen,
    open: openEditModal,
    close: closeEditModal,
  } = useModalState();
  const {
    isOpen: isEstadoModalOpen,
    open: openEstadoModal,
    close: closeEstadoModal,
  } = useModalState();
  const {
    isOpen: isViewModalOpen,
    open: openViewModal,
    close: closeViewModal,
  } = useModalState();
  const {
    currentPage,
    perPage,
    setCurrentPage,
    setPerPage,
    setPaginationData,
    paginationData,
  } = usePagination(50);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"usuarios" | "sin-usuario">(
    "usuarios",
  );
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [personasSinUsuario, setPersonasSinUsuario] = useState<
    PersonaSinUsuario[]
  >([]);
  const [todasPersonasSinUsuario, setTodasPersonasSinUsuario] = useState<{
    estudiantes: PersonaSinUsuario[];
    docentes: PersonaSinUsuario[];
    padres: PersonaSinUsuario[];
  }>({ estudiantes: [], docentes: [], padres: [] });
  const [selectedTipo, setSelectedTipo] = useState<
    "estudiante" | "docente" | "padre"
  >("estudiante");
  const [selectedPersona, setSelectedPersona] =
    useState<PersonaSinUsuario | null>(null);
  const [usarDniComoPassword, setUsarDniComoPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    is_active: true,
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [estudianteEstado, setEstudianteEstado] = useState<
    "activo" | "suspendido" | "egresado"
  >("activo");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchPersonas, setSearchPersonas] = useState("");
  const [filterTipoPersona, setFilterTipoPersona] = useState<
    "todos" | "estudiante" | "docente" | "padre"
  >("todos");

  useEffect(() => {
    fetchUsers();
    if (activeTab === "sin-usuario") {
      fetchTodasPersonasSinUsuario();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "usuarios") {
      fetchUsers();
    }
  }, [currentPage, perPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userManagementService.getAll({
        page: currentPage,
        per_page: perPage,
      });

      if (
        data &&
        typeof data === "object" &&
        "data" in data &&
        "current_page" in data
      ) {
        setUsers(data.data);
        setPaginationData({
          total: data.total || 0,
          lastPage: data.last_page || 1,
        });
      } else {
        const usersArray = Array.isArray(data) ? data : data?.data || [];
        setUsers(usersArray);
      }
    } catch (err: any) {
      handleError(err, "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonasSinUsuario = async (
    tipo: "estudiante" | "docente" | "padre",
  ) => {
    try {
      const data = await userManagementService.getPersonasSinUsuario(tipo);
      setPersonasSinUsuario(data);
    } catch (err: any) {
      handleError(err, "Error al cargar personas");
    }
  };

  const fetchTodasPersonasSinUsuario = async () => {
    try {
      setLoading(true);
      const [estudiantes, docentes, padres] = await Promise.all([
        userManagementService.getPersonasSinUsuario("estudiante"),
        userManagementService.getPersonasSinUsuario("docente"),
        userManagementService.getPersonasSinUsuario("padre"),
      ]);
      setTodasPersonasSinUsuario({ estudiantes, docentes, padres });
    } catch (err: any) {
      handleError(err, "Error al cargar personas sin usuario");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = async () => {
    setSelectedTipo("estudiante");
    await fetchPersonasSinUsuario("estudiante");
    setFormData({ email: "", password: "", is_active: true });
    setSelectedPersona(null);
    openCreateModal();
  };

  const handleTipoChange = async (tipo: "estudiante" | "docente" | "padre") => {
    setSelectedTipo(tipo);
    setSelectedPersona(null);
    await fetchPersonasSinUsuario(tipo);
  };

  const handlePersonaSelect = (persona: PersonaSinUsuario) => {
    setSelectedPersona(persona);
    if (persona.email) {
      setFormData((prev) => ({ ...prev, email: persona.email || "" }));
    }
    if (usarDniComoPassword && persona.dni) {
      setFormData((prev) => ({ ...prev, password: persona.dni }));
    }
  };

  const handleAsignarUsuarioRapido = async (
    persona: PersonaSinUsuario,
    tipo: "estudiante" | "docente" | "padre",
  ) => {
    const email = persona.email || `${persona.dni}@colegio.pe`;
    const password = usarDniComoPassword ? persona.dni : `${persona.dni}123`;

    if (
      !confirm(
        `¿Asignar usuario a ${persona.nombre_completo}?\nEmail: ${email}\nContraseña: ${password}`,
      )
    ) {
      return;
    }

    try {
      const payload: CreateUserPayload = {
        persona_id: persona.id,
        persona_tipo: tipo,
        email: email,
        password: password,
        is_active: true,
      };

      await userManagementService.create(payload);
      setSuccess(`Usuario creado para ${persona.nombre_completo}`);
      await fetchTodasPersonasSinUsuario();
    } catch (err: any) {
      handleError(err, "Error al crear usuario");
    }
  };

  const handleCreateUser = async () => {
    if (!selectedPersona) {
      setError("Debe seleccionar una persona");
      return;
    }

    if (!formData.email || !formData.password) {
      setError("Email y contraseña son requeridos");
      return;
    }

    try {
      const payload: CreateUserPayload = {
        persona_id: selectedPersona.id,
        persona_tipo: selectedTipo,
        email: formData.email,
        password: formData.password,
        is_active: formData.is_active,
      };

      await userManagementService.create(payload);
      setSuccess("Usuario creado exitosamente");
      closeCreateModal();
      await fetchUsers();
      await fetchTodasPersonasSinUsuario();
      setFormData({ email: "", password: "", is_active: true });
      setSelectedPersona(null);
    } catch (err: any) {
      handleError(err, "Error al crear usuario");
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      password: "",
    });
    openEditModal();
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      const payload: any = {
        name: editFormData.name,
        email: editFormData.email,
      };

      if (editFormData.password) {
        payload.password = editFormData.password;
      }

      await userManagementService.update(editingUser.id, payload);
      setSuccess("Usuario actualizado exitosamente");
      closeEditModal();
      await fetchUsers();
      setEditingUser(null);
    } catch (err: any) {
      handleError(err, "Error al actualizar usuario");
    }
  };

  const handleToggleActive = async (user: User) => {
    const action = user.is_active ? "desactivar" : "activar";
    if (!confirm(`¿Estás seguro de ${action} este usuario?`)) return;

    try {
      await userManagementService.toggleActive(user.id);
      setSuccess(`Usuario ${action}do exitosamente`);
      await fetchUsers();
    } catch (err: any) {
      handleError(err, "Error al cambiar estado del usuario");
    }
  };

  const handleOpenEstadoModal = (user: User) => {
    if (user.role !== "estudiante" || !user.persona) {
      setError("Solo se puede cambiar estado de estudiantes");
      return;
    }
    setEditingUser(user);
    setEstudianteEstado(user.persona.estado || "activo");
    openEstadoModal();
  };

  const handleViewUser = (user: User) => {
    setViewingUser(user);
    openViewModal();
  };

  const handleUpdateEstado = async () => {
    if (!editingUser || !editingUser.persona) return;

    try {
      await userManagementService.updateEstadoEstudiante(
        editingUser.persona.id,
        estudianteEstado,
      );
      setSuccess("Estado actualizado exitosamente");
      closeEstadoModal();
      await fetchUsers();
      setEditingUser(null);
    } catch (err: any) {
      handleError(err, "Error al actualizar estado");
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || user.role === filterRole;
    const matchesStatus =
      !filterStatus ||
      (filterStatus === "activo" && user.is_active) ||
      (filterStatus === "inactivo" && !user.is_active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const allPersonasSinUsuario = [
    ...todasPersonasSinUsuario.estudiantes.map((p) => ({
      ...p,
      uniqueId: `estudiante-${p.id}`,
      tipo: "estudiante" as const,
    })),
    ...todasPersonasSinUsuario.docentes.map((p) => ({
      ...p,
      uniqueId: `docente-${p.id}`,
      tipo: "docente" as const,
    })),
    ...todasPersonasSinUsuario.padres.map((p) => ({
      ...p,
      uniqueId: `padre-${p.id}`,
      tipo: "padre" as const,
    })),
  ];

  const filteredPersonasSinUsuario = allPersonasSinUsuario.filter((persona) => {
    const matchesSearch =
      persona.nombre_completo
        .toLowerCase()
        .includes(searchPersonas.toLowerCase()) ||
      persona.dni.includes(searchPersonas);
    const matchesTipo =
      filterTipoPersona === "todos" || persona.tipo === filterTipoPersona;
    return matchesSearch && matchesTipo;
  });

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      admin: "bg-red-100 text-red-800",
      auxiliar: "bg-purple-100 text-purple-800",
      docente: "bg-blue-100 text-blue-800",
      padre: "bg-green-100 text-green-800",
      estudiante: "bg-yellow-100 text-yellow-800",
      bibliotecario: "bg-indigo-100 text-indigo-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          colors[role] || "bg-gray-100 text-gray-800"
        }`}
      >
        {role}
      </span>
    );
  };

  const getEstadoBadge = (estado?: string) => {
    if (!estado) return null;
    const colors: Record<string, string> = {
      activo: "bg-green-100 text-green-800",
      suspendido: "bg-red-100 text-red-800",
      egresado: "bg-gray-100 text-gray-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          colors[estado] || "bg-gray-100 text-gray-800"
        }`}
      >
        {estado}
      </span>
    );
  };

  const getTipoBadge = (tipo: "estudiante" | "docente" | "padre") => {
    const colors: Record<string, string> = {
      estudiante: "bg-yellow-100 text-yellow-800",
      docente: "bg-blue-100 text-blue-800",
      padre: "bg-green-100 text-green-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${colors[tipo]}`}
      >
        {tipo}
      </span>
    );
  };

  const columnsPersonasSinUsuario = [
    {
      key: "nombre",
      label: "Nombre Completo",
      render: (_value: unknown, persona: any) => (
        <div>
          <div className="font-medium">{persona.nombre_completo}</div>
          <div className="text-sm text-gray-500">DNI: {persona.dni}</div>
        </div>
      ),
    },
    {
      key: "tipo",
      label: "Tipo",
      render: (_value: unknown, persona: any) => getTipoBadge(persona.tipo),
    },
    {
      key: "info",
      label: "Información",
      render: (_value: unknown, persona: any) => (
        <div className="text-sm text-gray-600">
          {persona.email && <div>Email: {persona.email}</div>}
          {persona.seccion && (
            <div>
              {persona.grado} - {persona.seccion}
            </div>
          )}
          {persona.especialidad && <div>{persona.especialidad}</div>}
          {persona.hijos_count !== undefined && (
            <div>{persona.hijos_count} hijo(s)</div>
          )}
        </div>
      ),
    },
    {
      key: "acciones",
      label: "Acciones",
      render: (_value: unknown, persona: any) => (
        <Button
          variant="primary"
          size="sm"
          onClick={() => handleAsignarUsuarioRapido(persona, persona.tipo)}
        >
          Asignar Usuario
        </Button>
      ),
    },
  ];

  const columns = [
    {
      key: "name",
      label: "Nombre",
      render: (_value: unknown, user: User) => (
        <div>
          <div className="font-medium">{user.name}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Rol",
      render: (_value: unknown, user: User) => getRoleBadge(user.role),
    },
    {
      key: "persona",
      label: "Información",
      render: (_value: unknown, user: User) => (
        <div className="text-sm">
          {user.persona ? (
            <div>
              {user.persona.dni && <div>DNI: {user.persona.dni}</div>}
              {user.persona.seccion && (
                <div>
                  {user.persona.grado} - {user.persona.seccion}
                </div>
              )}
              {user.persona.especialidad && (
                <div>{user.persona.especialidad}</div>
              )}
              {user.persona.hijos_count !== undefined && (
                <div>{user.persona.hijos_count} hijo(s)</div>
              )}
              {user.persona.estado && getEstadoBadge(user.persona.estado)}
            </div>
          ) : (
            <span className="text-gray-400">Sin información</span>
          )}
        </div>
      ),
    },
    {
      key: "is_active",
      label: "Estado",
      render: (_value: unknown, user: User) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            user.is_active
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {user.is_active ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      key: "acciones",
      label: "Acciones",
      render: (_value: unknown, user: User) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewUser(user)}
          >
            Ver
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditUser(user)}
          >
            Editar
          </Button>
          {user.role === "estudiante" && user.persona && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenEstadoModal(user)}
            >
              Estado
            </Button>
          )}
          <Button
            variant={user.is_active ? "danger" : "success"}
            size="sm"
            onClick={() => handleToggleActive(user)}
          >
            {user.is_active ? "Desactivar" : "Activar"}
          </Button>
        </div>
      ),
    },
  ];

  // Verificar permisos
  if (!user) {
    return (
      <div className="p-6">
        <Alert type="warning" message="Cargando información del usuario..." />
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="p-6">
        <Alert
          type="error"
          message="No tiene permisos para acceder a esta página. Solo los administradores pueden gestionar usuarios."
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestión de Usuarios
          </h1>
          <p className="text-gray-600 mt-1">
            Administra los usuarios del sistema y sus accesos
          </p>
        </div>
        <Button onClick={handleOpenCreateModal}>Crear Usuario</Button>
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

      {/* Pestañas */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("usuarios")}
              className={`${
                activeTab === "usuarios"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Usuarios con Cuenta ({users.length})
            </button>
            <button
              onClick={() => setActiveTab("sin-usuario")}
              className={`${
                activeTab === "sin-usuario"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Personas sin Usuario ({allPersonasSinUsuario.length})
            </button>
          </nav>
        </div>
      </div>

      {activeTab === "usuarios" ? (
        <>
          <Card className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="">Todos los roles</option>
                <option value="admin">Admin</option>
                <option value="auxiliar">Auxiliar</option>
                <option value="docente">Docente</option>
                <option value="padre">Padre</option>
                <option value="estudiante">Estudiante</option>
                <option value="bibliotecario">Bibliotecario</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
              </select>
            </div>
          </Card>

          <Card>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando usuarios...</p>
              </div>
            ) : (
              <Table columns={columns} data={filteredUsers} />
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
        </>
      ) : (
        <>
          <Card className="mb-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="usarDniPassword"
                    checked={usarDniComoPassword}
                    onChange={(e) => setUsarDniComoPassword(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="usarDniPassword"
                    className="text-sm text-gray-700"
                  >
                    Usar DNI como contraseña
                  </label>
                </div>
                <div className="text-sm text-gray-600">
                  {usarDniComoPassword
                    ? "Contraseña = DNI"
                    : 'Contraseña = DNI + "123"'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Buscar por nombre o DNI..."
                  value={searchPersonas}
                  onChange={(e) => setSearchPersonas(e.target.value)}
                />
                <select
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filterTipoPersona}
                  onChange={(e) => setFilterTipoPersona(e.target.value as any)}
                >
                  <option value="todos">Todos los tipos</option>
                  <option value="estudiante">Estudiantes</option>
                  <option value="docente">Docentes</option>
                  <option value="padre">Padres</option>
                </select>
              </div>
            </div>
          </Card>

          <Card>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando personas...</p>
              </div>
            ) : filteredPersonasSinUsuario.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {searchPersonas || filterTipoPersona !== "todos"
                    ? "No se encontraron personas sin usuario con los filtros aplicados"
                    : "¡Todas las personas tienen usuario asignado!"}
                </p>
              </div>
            ) : (
              <Table
                columns={columnsPersonasSinUsuario}
                data={filteredPersonasSinUsuario}
              />
            )}
          </Card>
        </>
      )}

      {/* Modal Crear Usuario */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        title="Crear Usuario"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Persona
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={selectedTipo}
              onChange={(e) => handleTipoChange(e.target.value as any)}
            >
              <option value="estudiante">Estudiante</option>
              <option value="docente">Docente</option>
              <option value="padre">Padre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seleccionar Persona
            </label>
            <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md">
              {personasSinUsuario.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No hay personas sin usuario de este tipo
                </div>
              ) : (
                personasSinUsuario.map((persona) => (
                  <div
                    key={persona.id}
                    onClick={() => handlePersonaSelect(persona)}
                    className={`p-3 cursor-pointer hover:bg-gray-50 border-b ${
                      selectedPersona?.id === persona.id ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="font-medium">{persona.nombre_completo}</div>
                    <div className="text-sm text-gray-600">
                      DNI: {persona.dni}
                      {persona.email && ` • Email: ${persona.email}`}
                      {persona.seccion &&
                        ` • ${persona.grado} - ${persona.seccion}`}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="usuario@correo.com"
            required
          />

          <Input
            label="Contraseña"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            placeholder="Mínimo 6 caracteres"
            required
          />

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData({ ...formData, is_active: e.target.checked })
              }
              className="mr-2"
            />
            <label htmlFor="is_active" className="text-sm text-gray-700">
              Usuario activo
            </label>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="secondary" onClick={closeCreateModal}>
              Cancelar
            </Button>
            <Button onClick={handleCreateUser} disabled={!selectedPersona}>
              Crear Usuario
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Editar Usuario */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        title="Editar Usuario"
      >
        <div className="space-y-4">
          <Input
            label="Nombre"
            value={editFormData.name}
            onChange={(e) =>
              setEditFormData({ ...editFormData, name: e.target.value })
            }
            required
          />

          <Input
            label="Email"
            type="email"
            value={editFormData.email}
            onChange={(e) =>
              setEditFormData({ ...editFormData, email: e.target.value })
            }
            required
          />

          <Input
            label="Nueva Contraseña (dejar vacío para no cambiar)"
            type="password"
            value={editFormData.password}
            onChange={(e) =>
              setEditFormData({ ...editFormData, password: e.target.value })
            }
            placeholder="Opcional"
          />

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="secondary" onClick={closeEditModal}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateUser}>Actualizar</Button>
          </div>
        </div>
      </Modal>

      {/* Modal Cambiar Estado Estudiante */}
      <Modal
        isOpen={isEstadoModalOpen}
        onClose={closeEstadoModal}
        title="Cambiar Estado del Estudiante"
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-sm text-yellow-800">
              <strong>Importante:</strong> Cambiar el estado afectará el acceso
              del estudiante al sistema.
            </p>
            <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
              <li>
                <strong>Activo:</strong> Puede acceder normalmente
              </li>
              <li>
                <strong>Suspendido:</strong> No puede acceder al sistema
              </li>
              <li>
                <strong>Egresado:</strong> No puede acceder, se revisarán los
                padres para desactivarlos si todos sus hijos egresaron
              </li>
            </ul>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nuevo Estado
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={estudianteEstado}
              onChange={(e) => setEstudianteEstado(e.target.value as any)}
            >
              <option value="activo">Activo</option>
              <option value="suspendido">Suspendido</option>
              <option value="egresado">Egresado</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="secondary" onClick={closeEstadoModal}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateEstado}>Actualizar Estado</Button>
          </div>
        </div>
      </Modal>

      {/* Modal Ver Detalles Usuario */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={closeViewModal}
        title="Detalles del Usuario"
        size="lg"
      >
        {viewingUser && (
          <div className="space-y-6">
            {/* Información Básica */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Información Básica
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">ID</p>
                  <p className="font-medium">{viewingUser.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nombre</p>
                  <p className="font-medium">{viewingUser.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{viewingUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Rol</p>
                  <p className="font-medium">
                    {getRoleBadge(viewingUser.role)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estado de Cuenta</p>
                  <p className="font-medium">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        viewingUser.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {viewingUser.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fecha de Creación</p>
                  <p className="font-medium">
                    {new Date(viewingUser.created_at).toLocaleDateString(
                      "es-ES",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Información de la Persona */}
            {viewingUser.persona && (
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Información de{" "}
                  {viewingUser.role === "estudiante"
                    ? "Estudiante"
                    : viewingUser.role === "docente"
                      ? "Docente"
                      : viewingUser.role === "padre"
                        ? "Padre"
                        : "Persona"}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {viewingUser.persona.nombre_completo && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Nombre Completo</p>
                      <p className="font-medium">
                        {viewingUser.persona.nombre_completo}
                      </p>
                    </div>
                  )}
                  {viewingUser.persona.dni && (
                    <div>
                      <p className="text-sm text-gray-500">DNI</p>
                      <p className="font-medium">{viewingUser.persona.dni}</p>
                    </div>
                  )}
                  {viewingUser.persona.estado && (
                    <div>
                      <p className="text-sm text-gray-500">Estado</p>
                      <p className="font-medium">
                        {getEstadoBadge(viewingUser.persona.estado)}
                      </p>
                    </div>
                  )}
                  {viewingUser.persona.grado && (
                    <div>
                      <p className="text-sm text-gray-500">Grado</p>
                      <p className="font-medium">{viewingUser.persona.grado}</p>
                    </div>
                  )}
                  {viewingUser.persona.seccion && (
                    <div>
                      <p className="text-sm text-gray-500">Sección</p>
                      <p className="font-medium">
                        {viewingUser.persona.seccion}
                      </p>
                    </div>
                  )}
                  {viewingUser.persona.especialidad && (
                    <div>
                      <p className="text-sm text-gray-500">Especialidad</p>
                      <p className="font-medium">
                        {viewingUser.persona.especialidad}
                      </p>
                    </div>
                  )}
                  {viewingUser.persona.hijos_count !== undefined && (
                    <div>
                      <p className="text-sm text-gray-500">Hijos Registrados</p>
                      <p className="font-medium">
                        {viewingUser.persona.hijos_count}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button variant="secondary" onClick={closeViewModal}>
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
