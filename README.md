# Sistema de Gestion Escolar - Frontend

Aplicacion web moderna desarrollada con Next.js 16, React 19 y TypeScript para la gestion integral de la I.E. N° 51006 "TUPAC AMARU". Interfaz responsive y profesional con sistema de roles completo.

## Tecnologias

- Framework: Next.js 16.0.10 (App Router)
- UI Library: React 19.2.0
- Lenguaje: TypeScript 5
- Estilos: Tailwind CSS 4
- Graficas: Recharts 3.6.0
- Autenticacion: JWT con Laravel Sanctum

## Requisitos Previos

- Node.js 20 o superior
- NPM o Yarn
- Backend API corriendo en http://localhost:8000

## Instalacion

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

## Credenciales de Prueba

| Rol               | Email                    | Contrasena     | Descripcion              |
| ----------------- | ------------------------ | -------------- | ------------------------ |
| Admin             | admin@colegio.pe         | admin123       | Acceso total al sistema  |
| Auxiliar          | auxiliar@colegio.pe      | auxiliar123    | Gestion academica        |
| Bibliotecario     | bibliotecario@colegio.pe | biblioteca2025 | Gestion de biblioteca    |
| Docente           | docente@colegio.pe       | docente123     | Portal docente           |
| Padre             | padre@colegio.pe         | padre123       | Ver informacion de hijos |
| Estudiante        | estudiante@colegio.pe    | estudiante123  | Portal estudiante        |

Usuarios adicionales:

- Docentes: docente{numero}@colegio.pe (contrasena: docente{numero})
- Padres: padre{numero}@colegio.pe (contrasena: padre{numero})
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

- Registro diario por materia con **3 estados**:
  - 🟢 **Presente**: Asistió puntualmente
  - 🟡 **Llegó Tarde**: Asistió con tardanza
  - 🔴 **Ausente**: No asistió
- Campo de **observaciones** (opcional, 500 caracteres)
- Filtros por fecha, estudiante, materia, estado
- Reportes de porcentaje de asistencia
- Estadísticas con tardanzas diferenciadas
- Exportación a Excel/CSV
- **Restricciones por rol**:
  - Admin/Auxiliar: Ver todas, crear, editar, eliminar
  - Docente: Solo de sus materias asignadas, crear y editar
  - Estudiante/Padre: Solo consulta

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
- **Asistencias** - Registro con 3 estados y observaciones
- **Horarios** - Vista de horarios personales

### 🟣 Portal Estudiante

- **Dashboard** - Promedio general, gráficas de rendimiento, asistencias, préstamos
- **Mis Calificaciones** - Vista por período con 4 tipos de gráficas interactivas:
  - Barras por materia
  - Radar comparativo
  - Donut por rangos
  - Línea de evolución
- **Mis Asistencias** - Porcentaje, gráficas (distribución por estado, por materia, tendencia)
  - Visualización de estados: Presente/Tarde/Ausente
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
  - Asistencias de Hijos\*\* - Visualización con estados (Presente/Tarde/Ausente)
- \*\*Soporte para múltiples hijos (tarjetas separadas)
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

## Problemas Conocidos

- Token invalido: Logout y login nuevamente
- Calificaciones no cargan (docente): Admin debe asignar materias
- Horarios vacios: Admin debe crear horarios para la seccion
- Padre no ve hijos: Admin debe vincular padre-estudiante
- No puede pedir prestamo: Verificar validaciones (limite 3, vencidos, stock)

## Historial de Actualizaciones

### Version 1.2.0 (19 Enero 2026) - Consolidacion UI

- Sistema de Grados y Secciones unificado en una sola pagina
- Vista dual con selector de modo (grados/secciones)
- Cards de grados con contadores de secciones y estudiantes
- Vista de secciones con turnos (Manana/Tarde) y barra de ocupacion
- Navegacion directa a Configuraciones (sin dropdown)
- Menu Secciones eliminado del Sidebar
- Estadisticas en tiempo real (6 metricas)

### Version 1.1.0 (14 Enero 2026)

- Sistema de Asistencias Mejorado: 3 estados con badges de colores
- Interfaz Actualizada: Formulario con radio buttons y observaciones
- Filtros Mejorados: Incluye estado "Llego Tarde"
- Exportacion Excel: Columna de estado actualizada
- Tipos TypeScript: Interface Asistencia actualizada
- Acceso por Roles: Todos los roles funcionan correctamente

---

Ultima actualizacion: 19 Enero 2026 | Version: 1.2.0
Proyecto para I.E. N 51006 "TUPAC AMARU" - Cusco, Peru
