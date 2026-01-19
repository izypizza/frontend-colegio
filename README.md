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

| Rol           | Email                    | Contrasena     | Descripcion              |
| ------------- | ------------------------ | -------------- | ------------------------ |
| Admin         | admin@colegio.pe         | admin123       | Acceso total al sistema  |
| Auxiliar      | auxiliar@colegio.pe      | auxiliar123    | Gestion academica        |
| Bibliotecario | bibliotecario@colegio.pe | biblioteca2025 | Gestion de biblioteca    |
| Docente       | docente@colegio.pe       | docente123     | Portal docente           |
| Padre         | padre@colegio.pe         | padre123       | Ver informacion de hijos |
| Estudiante    | estudiante@colegio.pe    | estudiante123  | Portal estudiante        |

Usuarios adicionales:

- Docentes: docente{numero}@colegio.pe (contrasena: docente{numero})
- Padres: padre{numero}@colegio.pe (contrasena: padre{numero})
- Estudiantes: estudiante{numero}@colegio.pe (contrasena: estudiante{numero})

## Modulos del Sistema

### Portal Administrativo (Admin/Auxiliar)

#### Gestion de Personal

- Estudiantes: CRUD completo, asignacion a secciones, vinculacion con padres
- Docentes: Registro con especialidad, asignacion de materias
- Padres: Registro y vinculacion con estudiantes
- Usuarios: Gestion de credenciales y roles

#### Gestion Academica

- Grados y Secciones: Sistema unificado con vista dual
  - Vista Grados: Cards con contador de secciones y estudiantes
  - Vista Secciones: Filtrado por grado con turnos (Manana/Tarde)
  - Gestion integrada desde una sola pagina
- Materias: Curriculo Nacional Peruano completo
- Periodos Academicos: Bimestres por ano escolar
- Horarios: Asignacion semanal por materia, docente y seccion

#### Gestion de Calificaciones

- Registro por estudiante, materia y periodo (escala vigesimal 0-20)
- Estadisticas avanzadas (solo admin/auxiliar):
  - Distribucion de notas
  - Rendimiento por materia
  - Comparativas por grado
  - Top estudiantes
- Restricciones por rol:
  - Admin/Auxiliar: Ver y crear todas
  - Docente: Solo materias asignadas
  - Estudiante/Padre: Solo consulta

#### Control de Asistencias

- Registro diario por materia con 3 estados:
  - Presente: Asistio puntualmente
  - Llego Tarde: Asistio con tardanza
  - Ausente: No asistio
- Campo de observaciones (opcional, 500 caracteres)
- Filtros por fecha, estudiante, materia, estado
- Reportes de porcentaje de asistencia
- Estadisticas con tardanzas diferenciadas
- Exportacion a Excel/CSV
- Restricciones por rol:
  - Admin/Auxiliar: Ver todas, crear, editar, eliminar
  - Docente: Solo de sus materias asignadas, crear y editar
  - Estudiante/Padre: Solo consulta

#### Biblioteca Digital

- Gestion de libros (ISBN, editorial, ano, stock)
- Sistema de prestamos con estados:
  - Pendiente → Aprobado/Rechazado → Devuelto
  - Aprobacion por bibliotecario
  - Validaciones: stock disponible, limite 3 activos, no vencidos, no duplicados

#### Sistema Electoral

- Creacion de elecciones estudiantiles
- Registro de candidatos con propuestas
- Gestion de estados (pendiente/activa/cerrada)
- Publicacion de resultados

#### Configuraciones

- Modo Mantenimiento: Activacion/desactivacion (solo admin)
- Permisos Auxiliares: Gestion de permisos granulares
- Navegacion directa sin dropdowns

### Portal Docente

- Dashboard: KPIs, clases asignadas, accesos rapidos
- Mis Clases: Asignaciones materia-seccion, lista de estudiantes
- Mis Estudiantes: Vista consolidada, filtro por seccion/materia
- Calificaciones: Solo materias asignadas, registro por periodo
- Asistencias: Registro con 3 estados y observaciones
- Horarios: Vista de horarios personales

### Portal Estudiante

- Dashboard: Promedio general, graficas de rendimiento, asistencias, prestamos
- Mis Calificaciones: Vista por periodo con 4 tipos de graficas interactivas:
  - Barras por materia
  - Radar comparativo
  - Donut por rangos
  - Linea de evolucion
- Mis Asistencias: Porcentaje, graficas (distribucion por estado, por materia, tendencia)
  - Visualizacion de estados: Presente/Tarde/Ausente
- Biblioteca: Catalogo, solicitud de prestamos, mis prestamos
- Elecciones: Ver candidatos, votar, ver resultados (1 voto por eleccion)
- Horarios: Vista semanal de clases

### Portal Padre

- Dashboard: Resumen de todos los hijos, comparativas
- Mis Hijos: Lista de hijos matriculados, informacion academica
- Calificaciones de Hijos: Vista por hijo con:
  - Selector de periodo academico
  - Graficas por hijo (barras, radar)
  - Promedio general y tabla detallada
  - Asistencias de Hijos: Visualizacion con estados (Presente/Tarde/Ausente)
- Soporte para multiples hijos (tarjetas separadas)
- Horarios: Vista de horarios de los hijos

## Caracteristicas de UI/UX

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

## Seguridad

- JWT tokens en localStorage
- Middleware de autenticacion en rutas protegidas
- Autorizacion por 6 roles
- Sidebar dinamico segun permisos
- Validacion frontend y backend

## Estructura del Proyecto

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

## Configuracion

### Variables de Entorno

Crear `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NODE_ENV=development
```

## Services API

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

## Comandos

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
