# Sistema de Gestión Escolar - Frontend

Aplicación web moderna desarrollada con **Next.js 16**, **React 19** y **TypeScript** para la gestión integral de la I.E. N° 51006 "TÚPAC AMARU". Interfaz responsive y profesional con sistema de roles completo.

## 🚀 Tecnologías

- **Framework**: Next.js 16.0.10 (App Router)
- **UI Library**: React 19.2.0
- **Lenguaje**: TypeScript 5
- **Estilos**: Tailwind CSS 4
- **Gráficas**: Recharts 3.6.0
- **Autenticación**: JWT con Laravel Sanctum

## 📋 Requisitos Previos

- Node.js 20 o superior
- NPM o Yarn
- Backend API corriendo en http://localhost:8000

## ⚡ Instalación

```bash
# Clonar repositorio
git clone https://github.com/izypizza/frontend-colegio.git
cd frontend-colegio

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🔐 Credenciales de Prueba

| Rol               | Email                    | Contraseña     | Descripción              |
| ----------------- | ------------------------ | -------------- | ------------------------ |
| **Admin**         | admin@colegio.pe         | admin123       | Acceso total al sistema  |
| **Auxiliar**      | auxiliar@colegio.pe      | auxiliar123    | Gestión académica        |
| **Bibliotecario** | bibliotecario@colegio.pe | biblioteca2025 | Gestión de biblioteca    |
| **Docente**       | docente@colegio.pe       | docente123     | Portal docente           |
| **Padre**         | padre@colegio.pe         | padre123       | Ver información de hijos |
| **Estudiante**    | estudiante@colegio.pe    | estudiante123  | Portal estudiante        |

**Usuarios adicionales:**

- Docentes: `docente{número}@colegio.pe` (contraseña: `docente{número}`)
- Padres: `padre{número}@colegio.pe` (contraseña: `padre{número}`)
- Estudiantes: `estudiante{número}@colegio.pe` (contraseña: `estudiante{número}`)

## 🎯 Módulos del Sistema

### 🔵 Portal Administrativo (Admin/Auxiliar)

#### Gestión de Personal

- **Estudiantes** - CRUD completo, asignación a secciones, vinculación con padres
- **Docentes** - Registro con especialidad, asignación de materias
- **Padres** - Registro y vinculación con estudiantes
- **Usuarios** - Gestión de credenciales y roles

#### Gestión Académica

- **Grados** - Niveles de Primaria y Secundaria
- **Secciones** - Múltiples secciones con tutores asignados
- **Materias** - Currículo Nacional Peruano completo
- **Períodos Académicos** - Bimestres por año escolar
- **Horarios** - Asignación semanal por materia, docente y sección

#### Gestión de Calificaciones

- Registro por estudiante, materia y período (escala vigesimal 0-20)
- **Estadísticas avanzadas** (solo admin/auxiliar):
  - Distribución de notas
  - Rendimiento por materia
  - Comparativas por grado
  - Top estudiantes
- **Restricciones por rol**:
  - Admin/Auxiliar: Ver y crear todas
  - Docente: Solo materias asignadas
  - Estudiante/Padre: Solo consulta

#### Control de Asistencias

- Registro diario por materia
- Filtros por fecha, estudiante, materia
- Reportes de porcentaje
- Solo admin/auxiliar/docente

#### Biblioteca Digital

- Gestión de libros (ISBN, editorial, año, stock)
- **Sistema de préstamos con estados**:
  - Pendiente → Aprobado/Rechazado → Devuelto
  - Aprobación por bibliotecario
  - Validaciones: stock disponible, límite 3 activos, no vencidos, no duplicados

#### Sistema Electoral

- Creación de elecciones estudiantiles
- Registro de candidatos con propuestas
- Gestión de estados (pendiente/activa/cerrada)
- Publicación de resultados

#### Configuraciones

- **Modo Mantenimiento** - Activación/desactivación (solo admin)
- **Permisos Auxiliares** - Gestión de permisos granulares

### 🟢 Portal Docente

- **Dashboard** - KPIs, clases asignadas, accesos rápidos
- **Mis Clases** - Asignaciones materia-sección, lista de estudiantes
- **Mis Estudiantes** - Vista consolidada, filtro por sección/materia
- **Calificaciones** - Solo materias asignadas, registro por período
- **Horarios** - Vista de horarios personales

### 🟣 Portal Estudiante

- **Dashboard** - Promedio general, gráficas de rendimiento, asistencias, préstamos
- **Mis Calificaciones** - Vista por período con 4 tipos de gráficas interactivas:
  - Barras por materia
  - Radar comparativo
  - Donut por rangos
  - Línea de evolución
- **Mis Asistencias** - Porcentaje, gráficas (distribución, por materia, tendencia)
- **Biblioteca** - Catálogo, solicitud de préstamos, mis préstamos
- **Elecciones** - Ver candidatos, votar, ver resultados (1 voto por elección)
- **Horarios** - Vista semanal de clases

### 🟡 Portal Padre

- **Dashboard** - Resumen de todos los hijos, comparativas
- **Mis Hijos** - Lista de hijos matriculados, información académica
- **Calificaciones de Hijos** - Vista por hijo con:
  - Selector de período académico
  - Gráficas por hijo (barras, radar)
  - Promedio general y tabla detallada
  - Soporte para múltiples hijos (tarjetas separadas)
- **Horarios** - Vista de horarios de los hijos

## 🎨 Características de UI/UX

### Diseño Responsive

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Menú hamburguesa en móviles
- Sidebar adaptado por rol

### Componentes Reutilizables

- Card, Button (primary/secondary/danger), Input
- Table (responsivas con paginación), Modal, Alert

### Gráficas Interactivas (Recharts)

- BarChart, RadarChart, PieChart/DonutChart, LineChart
- Tooltips con información contextual
- Responsive y adaptables

### Navegación

- Sidebar con menú adaptado por rol
- Navbar con usuario y logout
- Links activos con highlight

## 🔒 Seguridad

- JWT tokens en localStorage
- Middleware de autenticación en rutas protegidas
- Autorización por 6 roles
- Sidebar dinámico según permisos
- Validación frontend y backend

## 📁 Estructura del Proyecto

```
frontend-colegio/
├── app/
│   ├── (auth)/login/              # Login page
│   ├── dashboard/                 # Protected routes
│   │   ├── [admin modules]/       # Admin/Auxiliar modules
│   │   ├── docente/               # Docente portal
│   │   ├── estudiante/            # Estudiante portal
│   │   └── padre/                 # Padre portal
│   └── maintenance/               # Maintenance page
├── src/
│   ├── components/                # Reusable components
│   │   ├── layout/                # Layout components
│   │   └── ui/                    # UI components
│   ├── config/constants.ts        # Constants
│   ├── contexts/ThemeContext.tsx  # Preferences context
│   ├── features/auth/             # Auth feature
│   ├── lib/
│   │   ├── api-client.ts          # HTTP client
│   │   ├── services.ts            # API services
│   │   └── utils.ts               # Utilities
│   └── types/                     # TypeScript types
└── [config files]
```

## 🔧 Configuración

### Variables de Entorno

Crear `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NODE_ENV=development
```

## 📊 Services API

```typescript
// Autenticación
authService.login() / .logout() / .getCurrentUser()

// Dashboard
dashboardService.getStats()

// CRUD completo para: estudiante, docente, padre, grado, seccion, materia, periodo
[recurso]Service.getAll() / .getById() / .create() / .update() / .delete()

// Académico
calificacionService.estadisticasAvanzadas(periodo_id?)
asistenciaService.getAll() / .create()
horarioService.getAll() / .create()

// Biblioteca
libroService.getAll() / .create()
prestamoService.aprobar() / .rechazar() / .devolver()

// Elecciones
eleccionService.getAll() / .create()
votoService.votar(eleccion_id, candidato_id)

// Portales
docentePortalService.misClases() / .misEstudiantes()
estudiantePortalService.misCalificaciones() / .misAsistencias()
padrePortalService.misHijos() / .calificacionesHijos()
```

## 🚀 Comandos

```bash
npm run dev      # Desarrollo (localhost:3000)
npm run build    # Build producción
npm start        # Servidor producción
npm run lint     # ESLint
```

## 🐛 Problemas Conocidos

- **Token inválido**: Logout y login nuevamente
- **Calificaciones no cargan (docente)**: Admin debe asignar materias
- **Horarios vacíos**: Admin debe crear horarios para la sección
- **Padre no ve hijos**: Admin debe vincular padre-estudiante
- **No puede pedir préstamo**: Verificar validaciones (límite 3, vencidos, stock)

## 📝 Próximas Funcionalidades

- [ ] Notificaciones en tiempo real
- [ ] Exportación PDF/Excel
- [ ] Chat docente-padre
- [ ] Sistema de tareas
- [ ] Modo oscuro
- [ ] PWA
- [ ] Tests (Jest + Playwright)

## 📄 Licencia

Proyecto privado - I.E. N° 51006 "TÚPAC AMARU" - Cusco, Perú

---

**Última actualización**: Enero 2026 | **Versión**: 1.0.0
