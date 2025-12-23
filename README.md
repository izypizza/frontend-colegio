# Sistema de Gestión Escolar - Frontend

Interfaz web moderna para la gestión integral de instituciones educativas. Cliente del sistema desarrollado con las últimas tecnologías web.

## 🚀 Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Next.js** | 16.0.10 | Framework React con App Router y Turbopack |
| **React** | 19.2.0 | Biblioteca UI con Server Components |
| **TypeScript** | 5.x | Tipado estático y seguridad de tipos |
| **Tailwind CSS** | 4.x | Framework de estilos utility-first |
| **Laravel Sanctum** | - | Autenticación por tokens con backend |
| **Fetch API** | Nativo | Cliente HTTP moderno del navegador |

## ✨ Características Principales

### Sistema de Roles (5 Roles Implementados)

| Rol | Acceso | Permisos |
|-----|--------|----------|
| 🔐 **Admin** | Total | Gestión completa: usuarios, configuración, reportes, todos los módulos |
| 👔 **Auxiliar** | Administrativo | Estudiantes, padres, asistencias, calificaciones, secciones |
| 👨‍🏫 **Docente** | Académico | Materias propias, asistencias de sus cursos, calificaciones |
| 👨‍👩‍👧 **Padre** | Consulta | Información de hijos (calificaciones, asistencias, horarios) |
| 🎓 **Estudiante** | Consulta | Información personal (notas, horarios, asistencias) |

### Control de Acceso y Seguridad

✅ **Hooks personalizados para permisos:**
```typescript
import { useRolePermissions } from '@/features/auth/hooks/useRolePermissions';

const { hasAdminAccess, hasRole, getPermissions, getAccessibleRoutes } = useRolePermissions();

// Verificar acceso administrativo
if (hasAdminAccess(user.role)) { /* Admin o Auxiliar */ }

// Verificar rol específico
if (hasRole(user.role, [UserRole.DOCENTE])) { /* Solo docentes */ }

// Obtener permisos del rol
const permissions = getPermissions(user.role);
if (permissions.canManageStudents) { /* Gestionar estudiantes */ }
```

✅ **Componente RoleGuard para protección de UI:**
```tsx
import { RoleGuard } from '@/components/auth/RoleGuard';

<RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.AUXILIAR]}>
  <AdminPanel />
</RoleGuard>
```

### Arquitectura y Funcionalidades

- ✅ **Autenticación completa** - Login con Laravel Sanctum, gestión de tokens
- ✅ **Protección de rutas** - Middleware de autenticación y redirección automática
- ✅ **Sidebar dinámico** - Menú filtrado según rol del usuario
- ✅ **Modales CRUD** - Formularios de creación/edición en ventanas modales
- ✅ **Feature-based architecture** - Código organizado por funcionalidades
- ✅ **Componentes UI reutilizables** - Button, Input, Card, Modal, Table, Alert, Toast
- ✅ **API Client centralizado** - Gestión consistente de peticiones HTTP
- ✅ **Tipos TypeScript** - 100% tipado para seguridad y autocompletado
- ✅ **Diseño responsive** - Adaptable a móviles, tablets y escritorio

## 📦 Instalación y Configuración

### Prerrequisitos

- Node.js 20+ instalado
- npm o yarn como gestor de paquetes
- Backend Laravel ejecutándose en `http://localhost:8000`

### Pasos de Instalación

```bash
# 1. Clonar el repositorio
git clone <url-repositorio>
cd frontend-colegio

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local

# Editar .env.local:
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME="Sistema Colegio"
NEXT_PUBLIC_APP_VERSION="1.0.0"

# 4. Ejecutar en desarrollo (con Turbopack)
npm run dev

# La aplicación estará disponible en http://localhost:3000
```

### Credenciales de Prueba

Usa estas credenciales para probar diferentes roles:

| Rol | Email | Contraseña |
|-----|-------|------------|
| 👨‍💼 Admin | admin@colegio.pe | password |
| 👔 Auxiliar | auxiliar@colegio.pe | password |
| 👨‍🏫 Docente | docente@colegio.pe | password |
| 👨‍👩‍👧 Padre | padre@colegio.pe | password |
| 🎓 Estudiante | estudiante@colegio.pe | password |

### Comandos Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo con Turbopack
npm run dev:debug        # Desarrollo con modo debug activado

# Producción
npm run build            # Compilar para producción
npm start                # Ejecutar build de producción
npm run export           # Generar exportación estática

# Utilidades
npm run lint             # Verificar código con ESLint
npm run lint:fix         # Corregir errores de linting automáticamente
npm run type-check       # Verificar tipos TypeScript
```

## 🗂️ Estructura del Proyecto

```
frontend-colegio/
├── app/                          # App Router de Next.js 16
│   ├── (auth)/login/             # Página de autenticación
│   ├── dashboard/                # Módulos del dashboard
│   │   ├── estudiantes/          # ✅ CRUD con modales
│   │   ├── docentes/             # ✅ CRUD con modales
│   │   ├── padres/               # ✅ CRUD con modales
│   │   ├── asistencias/          # ✅ Registro con modales
│   │   ├── calificaciones/       # ✅ Gestión con modales
│   │   ├── grados/               # ✅ CRUD con modales
│   │   ├── secciones/            # ✅ CRUD con modales
│   │   ├── materias/             # ✅ CRUD con modales
│   │   ├── horarios/             # ✅ CRUD con modales
│   │   └── periodos/             # ✅ CRUD con modales
│   ├── layout.tsx                # Layout raíz
│   └── globals.css               # Estilos globales Tailwind
│
├── src/
│   ├── components/
│   │   ├── auth/                 # Componentes de autenticación
│   │   │   └── RoleGuard.tsx     # ✅ Protección por roles
│   │   ├── layout/               # Componentes de layout
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Navbar.tsx        # ✅ Header con usuario
│   │   │   └── Sidebar.tsx       # ✅ Menú dinámico por rol
│   │   └── ui/                   # Sistema de componentes base
│   │       ├── Alert.tsx         # ✅ Alertas contextuales
│   │       ├── Button.tsx        # ✅ Botones con variantes
│   │       ├── Card.tsx          # ✅ Tarjetas contenedoras
│   │       ├── Input.tsx         # ✅ Campos de formulario
│   │       ├── Modal.tsx         # ✅ Ventanas modales (z-index fix)
│   │       ├── Table.tsx         # ✅ Tablas responsivas
│   │       └── Toast.tsx         # ✅ Notificaciones temporales
│   │
│   ├── features/                 # Organización por features
│   │   └── auth/
│   │       ├── components/
│   │       │   └── LoginForm.tsx # ✅ Formulario de login
│   │       ├── hooks/
│   │       │   ├── useAuth.tsx   # ✅ Context de autenticación
│   │       │   ├── useRedirect.ts
│   │       │   └── useRolePermissions.ts # ✅ Permisos por rol
│   │       └── services/
│   │           └── auth.service.ts # ✅ API de autenticación
│   │
│   ├── lib/                      # Librerías y utilidades
│   │   ├── api-client.ts         # ✅ Cliente HTTP centralizado
│   │   ├── services.ts           # ✅ Servicios base
│   │   └── utils.ts              # ✅ Funciones auxiliares
│   │
│   ├── types/                    # Tipos TypeScript
│   │   ├── index.ts              # Tipos generales
│   │   └── models.ts             # ✅ Modelos sincronizados con backend
│   │
│   └── config/
│       └── constants.ts          # ✅ Constantes de configuración
│
├── public/                       # Assets estáticos
├── .env.local                    # Variables de entorno (no en git)
├── next.config.ts                # Configuración de Next.js
├── tailwind.config.ts            # Configuración de Tailwind CSS 4
├── tsconfig.json                 # Configuración de TypeScript
├── eslint.config.mjs             # Configuración de ESLint
├── postcss.config.mjs            # Configuración de PostCSS
└── package.json                  # Dependencias del proyecto
```

## 🔌 Integración con Backend

### Configuración de API

El frontend se conecta al backend Laravel mediante el cliente HTTP centralizado:

```typescript
// src/lib/api-client.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const apiClient = {
  get: async (endpoint) => { /* ... */ },
  post: async (endpoint, data) => { /* ... */ },
  put: async (endpoint, data) => { /* ... */ },
  delete: async (endpoint) => { /* ... */ },
};
```

### Endpoints Disponibles

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| POST | `/auth/login` | Iniciar sesión | Público |
| GET | `/auth/me` | Obtener usuario actual | Autenticado |
| POST | `/auth/logout` | Cerrar sesión | Autenticado |
| GET | `/estudiantes` | Listar estudiantes | Admin, Auxiliar |
| POST | `/estudiantes` | Crear estudiante | Admin, Auxiliar |
| PUT | `/estudiantes/{id}` | Actualizar estudiante | Admin, Auxiliar |
| DELETE | `/estudiantes/{id}` | Eliminar estudiante | Admin |
| GET | `/docentes` | Listar docentes | Admin, Auxiliar |
| POST | `/docentes` | Crear docente | Admin |
| PUT | `/docentes/{id}` | Actualizar docente | Admin |
| DELETE | `/docentes/{id}` | Eliminar docente | Admin |
| GET | `/padres` | Listar padres | Admin, Auxiliar |
| GET | `/calificaciones` | Listar calificaciones | Según rol |
| GET | `/asistencias` | Listar asistencias | Según rol |

### Sincronización de Datos

**Estado actual (Backend):**
- ✅ 187 usuarios registrados en base de datos
- ✅ 15 docentes con `user_id` vinculado
- ✅ 50 padres con `user_id` vinculado
- ✅ 118 estudiantes con `user_id` vinculado
- ✅ 0 registros huérfanos (100% sincronizado)

**Modelos TypeScript sincronizados:**
```typescript
// src/types/models.ts

export enum UserRole {
  ADMIN = 'admin',
  AUXILIAR = 'auxiliar',
  DOCENTE = 'docente',
  PADRE = 'padre',
  ESTUDIANTE = 'estudiante',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
}

export interface Estudiante {
  id: number;
  user_id?: number;
  nombre: string;
  fecha_nacimiento: string;
  seccion_id: number;
  dni?: string;
  telefono?: string;
  direccion?: string;
}

export interface Docente {
  id: number;
  user_id?: number;
  nombre: string;
  especialidad: string;
  email?: string;
  telefono?: string;
  dni?: string;
  direccion?: string;
}

export interface Padre {
  id: number;
  user_id?: number;
  nombre: string;
  email?: string;
  telefono?: string;
  dni?: string;
  direccion?: string;
  ocupacion?: string;
}
```

## 📊 Módulos Implementados

### ✅ Completados con CRUD y Modales

| Módulo | Crear | Leer | Actualizar | Eliminar | Filtros |
|--------|-------|------|------------|----------|---------|
| **Estudiantes** | ✅ | ✅ | ✅ | ✅ | ⏳ |
| **Docentes** | ✅ | ✅ | ✅ | ✅ | ⏳ |
| **Padres** | ✅ | ✅ | ✅ | ✅ | ⏳ |
| **Grados** | ✅ | ✅ | ✅ | ✅ | ⏳ |
| **Secciones** | ✅ | ✅ | ✅ | ✅ | ⏳ |
| **Materias** | ✅ | ✅ | ✅ | ✅ | ⏳ |
| **Horarios** | ✅ | ✅ | ✅ | ✅ | ⏳ |
| **Asistencias** | ✅ | ✅ | ✅ | ✅ | ⏳ |
| **Calificaciones** | ✅ | ✅ | ✅ | ✅ | ⏳ |
| **Períodos** | ✅ | ✅ | ✅ | ✅ | ⏳ |

### Características de los Módulos

- **Modales funcionalmente** - Botones de creación/edición abren ventanas modales sin bugs
- **Formularios dentro de modales** - Botones de acción colocados correctamente dentro del form
- **Diseño responsive** - Tablas y formularios adaptables a diferentes tamaños de pantalla
- **Validación de datos** - Campos requeridos y formatos validados
- **Feedback visual** - Alertas de éxito/error en operaciones CRUD

## 🎯 Roadmap y Mejoras Futuras

### Prioridad Alta 🔴

- [ ] **Búsqueda y filtrado avanzado** - Buscar por nombre, DNI, sección en todas las tablas
- [ ] **Paginación** - Implementar paginación en tablas con muchos registros
- [ ] **Validación robusta** - Usar react-hook-form + zod para validación de formularios
- [ ] **Confirmación de eliminación** - Modales de confirmación antes de eliminar registros
- [ ] **Manejo de errores mejorado** - Mensajes de error más descriptivos y amigables

### Prioridad Media 🟡

- [ ] **Dashboard con gráficos** - Chart.js o Recharts para visualizaciones
- [ ] **Reportes en PDF** - Generación de boletines y reportes imprimibles
- [ ] **Exportación a Excel** - Descargar listados y reportes en formato Excel
- [ ] **Modo oscuro** - Implementar dark mode con toggle
- [ ] **Optimización de performance** - React Query o SWR para cache de datos
- [ ] **Loading states mejorados** - Skeletons en lugar de spinners genéricos
- [ ] **Infinite scroll** - En listas muy largas para mejor UX

### Prioridad Baja 🟢

- [ ] **Notificaciones en tiempo real** - WebSockets para notificaciones push
- [ ] **Sistema de mensajería** - Chat interno entre usuarios
- [ ] **App móvil** - React Native para Android/iOS
- [ ] **Internacionalización** - Soporte multi-idioma (i18n)
- [ ] **Testing completo** - Jest + React Testing Library + Playwright
- [ ] **CI/CD** - GitHub Actions para deploy automatizado

## 🐛 Problemas Resueltos

### Arreglos Implementados

- ✅ **Error de hidratación React** - Solucionado moviendo viewport a exportación separada
- ✅ **CORS bloqueado** - Configurado correctamente en backend Laravel
- ✅ **Modales bugueados** - z-index ajustado a 9999, prevención de scroll, click handling correcto
- ✅ **Botones fuera del form** - Movidos dentro de los formularios en todos los modales
- ✅ **Menú estático** - Sidebar ahora filtra opciones dinámicamente según rol del usuario
- ✅ **Token no persistente** - Guardado en localStorage con manejo de expiración

## 🚀 Despliegue en Producción

### Build de Producción

```bash
# 1. Compilar la aplicación
npm run build

# 2. Iniciar servidor de producción
npm start

# O usando PM2
pm2 start npm --name "frontend-colegio" -- start
```

### Variables de Entorno Producción

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.tu-dominio.com/api
NEXT_PUBLIC_APP_NAME="Sistema Colegio Túpac Amaru"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

### Deploy en Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Optimizaciones Recomendadas

```bash
# Antes del deploy:
npm run lint              # Verificar código
npm run type-check        # Verificar tipos
npm run build             # Compilar

# Optimizaciones automáticas de Next.js 16:
# ✅ Turbopack en desarrollo
# ✅ Server Components por defecto
# ✅ Image optimization con next/image
# ✅ Code splitting automático
# ✅ Tree shaking de dependencias
```

## 🤝 Contribución y Estándares

### Convenciones de Código

- **Componentes** - PascalCase (`DashboardLayout.tsx`)
- **Funciones/variables** - camelCase (`getUserData`)
- **Constantes** - UPPER_SNAKE_CASE (`API_URL`)
- **Archivos CSS** - kebab-case (`dashboard-layout.css`)
- **TypeScript** - Tipos explícitos en funciones públicas
- **Comentarios** - Explicar "por qué", no "qué"

### Flujo de Trabajo Git

```bash
# 1. Crear rama para feature
git checkout -b feature/nombre-funcionalidad

# 2. Hacer commits descriptivos
git commit -m "feat: agregar filtro de búsqueda en estudiantes"
git commit -m "fix: corregir modal que no cerraba"
git commit -m "refactor: optimizar renderizado de tabla"

# 3. Push y crear Pull Request
git push origin feature/nombre-funcionalidad
```

### Estructura de Commits

- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bug
- `refactor:` - Refactorización sin cambio de funcionalidad
- `style:` - Cambios de formato (no afectan código)
- `docs:` - Cambios en documentación
- `test:` - Agregar o modificar tests
- `chore:` - Tareas de mantenimiento

---

**Desarrollado con ❤️ para el Sistema Escolar Túpac Amaru**  
**Última actualización:** 16 de diciembre de 2025  
**Versión:** 1.0.0  
**Estado:** ✅ En Producción
