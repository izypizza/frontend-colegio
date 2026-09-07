# Sistema de Gestión Escolar — Frontend

Aplicación web en **Next.js** (App Router) y **TypeScript** que consume la API Laravel del backend (`backend-colegio`) y ofrece dashboards, CRUDs, gráficas y flujos completos de asistencia, calificaciones, biblioteca, préstamos y elecciones, con portales específicos por rol (admin, auxiliar, bibliotecario, docente, padre, estudiante).

## Stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript 5 (strict)
- Tailwind CSS 4, Recharts 3.6 (gráficas), Shepherd.js (asistente/tours guiados)
- Autenticación por token emitido por **Sanctum** (Bearer en cada petición al backend)

## Requisitos

- Node 20+
- Backend corriendo en `http://localhost:8000` (con CORS y Sanctum configurados)

## Puesta en marcha

1. Instalar dependencias:

```
npm install
```

2. Crear `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

> ⚠️ Es importante ejecutar `npm run dev` **desde la carpeta `frontend-colegio`** (el cwd afecta a Turbopack).

3. Desarrollo:

```
npm run dev   # http://localhost:3000
```

4. Producción:

```
npm run build
npm start
```

5. Calidad: `npm run lint`

## Credenciales de prueba

Usa las mismas credenciales sembradas por el backend:

- admin@colegio.pe / admin123
- auxiliar@colegio.pe / auxiliar123
- bibliotecario@colegio.pe / biblioteca2025
- docente@colegio.pe / docente123
- padre@colegio.pe / padre123
- estudiante@colegio.pe / estudiante123

Usuarios adicionales: `docente{n}@colegio.pe`, `padre{n}@colegio.pe`, `estudiante{n}@colegio.pe` (contraseña igual al sufijo).

## Módulos principales (41 rutas)

- Autenticación, redirección `/` y página de mantenimiento
- **Dashboard por rol** (admin/auxiliar, docente, estudiante, padre)
- **Gestión académica:** grados, secciones, materias, períodos, horarios
- **Gestión de personas/usuarios:** estudiantes, docentes, padres, usuarios del sistema, bibliotecarios, auxiliares
- **Calificaciones:** registro, boletines, filtros y gráficas (barras, radar, dona, línea)
- **Asistencias:** registro por materia con 3 estados y reportes
- **Biblioteca y préstamos:** catálogo físico/digital y flujo pendiente → aprobado/rechazado → devuelto
- **Elecciones escolares:** configuración (partidos/candidatos), votación única y resultados
- **Comunicación:** chat docente–padre (interfaz de burbujas con identificación por rol), notificaciones y monitoreo de chat (admin)
- **Administración:** auditoría, configuración (modo mantenimiento, módulos activos), permisos auxiliares
- **Portales:** docente (mis clases, mis estudiantes, tutoría), estudiante (calificaciones, asistencias, biblioteca), padre (mis hijos, calificaciones)

## Roles y permisos

- El **Sidebar** (`src/components/layout/Sidebar.tsx`) filtra el menú por rol + módulos activos.
- Los permisos por módulo/acción se definen en `src/lib/permissions.ts` (`MODULE_PERMISSIONS`) y **deben coincidir** con el backend (`PermissionMiddleware`).
- `PermissionGuard` y `RoleGuard` protegen páginas; los hooks `usePermissions`, `useAuth` controlan acciones visibles.

## Asistente / Tour

- Botón flotante (Shepherd.js) en el dashboard.
- **Tour completo**: recorrido guiado que navega por todas las secciones a las que el rol tiene acceso.
- Correcciones incluidas: sidebar con `backdrop-blur` en móvil; errores mostrados dentro de los modales.

## Estructura relevante

```
app/
  (auth)/login/            # acceso
  maintenance/             # página de mantenimiento
  dashboard/               # rutas protegidas y módulos
    asistencias/, biblioteca/, calificaciones/, elecciones/, configuraciones/
    chat/, chat-admin/
    docente/, estudiante/, padre/     # portales por rol
    usuarios/, grados/, secciones/, materias/, periodos/, etc.
src/
  components/              # layout (Sidebar/Navbar), auth (guards) y UI reutilizable
  config/constants.ts      # constantes globales (rutas, API)
  contexts/ThemeContext.tsx
  features/auth/           # AuthProvider, useAuth, login
  hooks/                   # helpers de UI/estado (permisos, paginación, modales, etc.)
  lib/api-client.ts        # cliente HTTP (manejo de 401/403/503)
  lib/services.ts          # endpoints agrupados por recurso
  lib/permissions.ts       # matriz de permisos por módulo
  types/                   # tipados compartidos (UserRole, modelos)
```

## Notas de integración

- Las rutas protegidas envían el header `Authorization: Bearer <token>` emitido por el backend (Sanctum).
- Si ves 401/403: revisa expiración de token y permisos de rol; el sidebar se ajusta al rol.
- Para CORS/CSRF: asegura `SANCTUM_STATEFUL_DOMAINS=localhost:3000` y `FRONTEND_URL=http://localhost:3000` en el backend.
- Repositorio: https://github.com/izypizza/frontend-colegio
