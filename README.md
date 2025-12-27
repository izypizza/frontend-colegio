# 🎓 Sistema de Gestión Escolar - Frontend

Aplicación web moderna desarrollada con **Next.js 16**, **React 19** y **TypeScript** para la gestión integral de instituciones educativas. Interfaz intuitiva con diseño responsive y sistema de roles completo.

## ✨ Características Principales

### 🎨 Interfaz Moderna
- **Diseño atractivo** con gradientes y animaciones suaves
- **Responsive** - Funciona en móvil, tablet y desktop
- **Componentes reutilizables** - Sistema de diseño consistente
- **Vistas múltiples** - Grid y lista intercambiables
- **Filtros avanzados** - Búsqueda y filtrado en tiempo real
- **Estadísticas visuales** - Cards con métricas importantes

### 👥 Sistema de Roles (5 Roles)

| Rol | Permisos | Funcionalidades |
|-----|----------|-----------------|
| 🔐 **Admin** | Control total | CRUD completo de todos los módulos |
| 👔 **Auxiliar** | Administrativo | Estudiantes, padres, asistencias, calificaciones |
| 👨‍🏫 **Docente** | Académico | Mis clases, estudiantes, calificaciones, asistencias |
| 👨‍👩‍👧 **Padre** | Consulta | Información de mis hijos (notas, asistencias) |
| 🎓 **Estudiante** | Consulta | Mi perfil, notas, asistencias, horarios |

### 📊 Módulos Implementados

#### Gestión Académica
- ✅ **Grados** - Vista cards con estadísticas por nivel
- ✅ **Secciones** - Grid/Lista con capacidad y turno
- ✅ **Materias** - Catálogo completo
- ✅ **Horarios** - Calendario por sección
- ✅ **Períodos Académicos** - Bimestres/Trimestres

#### Gestión de Personas
- ✅ **Estudiantes** - CRUD con matrícula
- ✅ **Docentes** - Perfil con especialidad
- ✅ **Padres** - Relación con estudiantes
- ✅ **Asignaciones** - Docente-Materia-Sección

#### Sistema de Evaluación
- ✅ **Calificaciones** - Registro por período
- ✅ **Asistencias** - Control diario
- ✅ **Reportes** - Boletines y estadísticas

#### Portales Personalizados
- ✅ **Portal Docente** - Mis clases, estudiantes, calificaciones
- ✅ **Portal Estudiante** - Mis notas, asistencias, horarios
- ✅ **Portal Padre** - Seguimiento de hijos

#### Sistemas Adicionales
- ✅ **Biblioteca Digital** - Catálogo y préstamos
- ✅ **Elecciones Escolares** - Votación estudiantil
- ✅ **Dashboard** - Estadísticas por rol

## 🚀 Tecnologías

### Core
- **Next.js 16** - Framework React con App Router
- **React 19** - Biblioteca UI con Server Components
- **TypeScript 5** - Tipado estático
- **Tailwind CSS 4** - Framework de estilos

### Herramientas
- **ESLint** - Linting de código
- **PostCSS** - Procesamiento CSS
- **Turbopack** - Build tool ultra rápido

## 📦 Instalación

### Requisitos
- Node.js >= 18.0
- npm >= 9.0 o yarn >= 1.22
- Backend API corriendo en http://localhost:8000

### Paso 1: Clonar e Instalar
```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/frontend-colegio.git
cd frontend-colegio

# Instalar dependencias
npm install
# o
yarn install
```

### Paso 2: Configurar Variables de Entorno
Crear `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_TIMEOUT=30000
```

### Paso 3: Iniciar Servidor de Desarrollo
```bash
npm run dev
# o
yarn dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 🔑 Usuarios de Prueba

| Email | Password | Rol | Descripción |
|-------|----------|-----|-------------|
| admin@colegio.pe | password | Admin | Control total del sistema |
| auxiliar@colegio.pe | password | Auxiliar | Personal administrativo |
| docente@colegio.pe | password | Docente | Profesor con 4 asignaciones |
| padre@colegio.pe | password | Padre | Padre con 2 hijos |
| estudiante@colegio.pe | password | Estudiante | Estudiante matriculado |

## 📁 Estructura del Proyecto

```
frontend-colegio/
├── app/                          # App Router de Next.js
│   ├── (auth)/                   # Grupo de rutas de autenticación
│   │   └── login/
│   │       └── page.tsx          # Página de login
│   ├── dashboard/                # Aplicación principal
│   │   ├── layout.tsx            # Layout con sidebar y navbar
│   │   ├── page.tsx              # Dashboard principal
│   │   ├── asistencias/          # Módulo de asistencias
│   │   ├── biblioteca/           # Sistema de biblioteca
│   │   ├── calificaciones/       # Gestión de notas
│   │   ├── docente/              # Portal docente
│   │   │   ├── mis-clases/
│   │   │   └── mis-estudiantes/
│   │   ├── docentes/             # CRUD docentes
│   │   ├── elecciones/           # Sistema de votación
│   │   ├── estudiante/           # Portal estudiante
│   │   │   ├── mis-asistencias/
│   │   │   └── mis-calificaciones/
│   │   ├── estudiantes/          # CRUD estudiantes
│   │   ├── grados/               # Gestión de grados (REDISEÑADO)
│   │   ├── horarios/             # Horarios escolares
│   │   ├── materias/             # Catálogo de materias
│   │   ├── padre/                # Portal padre
│   │   │   ├── calificaciones/
│   │   │   └── mis-hijos/
│   │   ├── padres/               # CRUD padres
│   │   ├── periodos/             # Períodos académicos
│   │   ├── prestamos/            # Préstamos biblioteca
│   │   └── secciones/            # Gestión de secciones (REDISEÑADO)
│   ├── globals.css               # Estilos globales
│   ├── layout.tsx                # Layout raíz
│   └── page.tsx                  # Página de inicio
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── RoleGuard.tsx     # Protección por roles
│   │   ├── layout/
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Navbar.tsx        # Barra superior
│   │   │   └── Sidebar.tsx       # Menú lateral por rol
│   │   └── ui/                   # Componentes reutilizables
│   │       ├── Alert.tsx
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── Select.tsx
│   │       └── Table.tsx
│   ├── config/
│   │   └── constants.ts          # Constantes globales
│   ├── features/
│   │   └── auth/
│   │       ├── hooks/
│   │       │   └── useAuth.tsx   # Hook de autenticación
│   │       └── services/
│   │           └── authService.ts
│   ├── lib/
│   │   ├── api-client.ts         # Cliente HTTP con Fetch API
│   │   ├── services.ts           # Servicios API (17 servicios)
│   │   └── utils.ts              # Utilidades
│   └── types/
│       ├── index.ts
│       └── models.ts             # Interfaces TypeScript (27 modelos)
├── public/                       # Archivos estáticos
├── .env.local                    # Variables de entorno
├── next.config.ts                # Configuración Next.js
├── tailwind.config.ts            # Configuración Tailwind
├── tsconfig.json                 # Configuración TypeScript
└── package.json                  # Dependencias
```

## 🎨 Componentes UI

### Sistema de Diseño
Todos los componentes siguen un sistema de diseño consistente:

#### Button
```tsx
<Button variant="primary" size="md" onClick={handleClick}>
  Guardar
</Button>

// Variants: primary, secondary, danger, success, ghost
// Sizes: sm, md, lg
```

#### Card
```tsx
<Card className="hover:shadow-lg">
  <h3>Título</h3>
  <p>Contenido</p>
</Card>
```

#### Modal
```tsx
<Modal 
  isOpen={isOpen} 
  onClose={onClose}
  title="Título del Modal"
  size="lg"
  footer={<Button onClick={save}>Guardar</Button>}
>
  <Content />
</Modal>

// Sizes: sm, md, lg, xl
```

#### Table
```tsx
<Table
  columns={columns}
  data={data}
  loading={loading}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

#### Alert
```tsx
<Alert 
  type="success" 
  message="Operación exitosa"
  onClose={() => setAlert(null)}
/>

// Types: success, error, warning, info
```

## 🔐 Autenticación

### Sistema de Autenticación
- **Laravel Sanctum** - Tokens de sesión
- **LocalStorage** - Almacenamiento de tokens
- **Middleware** - Protección de rutas
- **RoleGuard** - Control por roles

### Hook useAuth
```tsx
const { user, login, logout, isAuthenticated } = useAuth();

// Login
await login({ email, password });

// Logout
await logout();

// Verificar rol
if (user?.role === 'admin') { ... }
```

### Protección de Rutas
```tsx
// Proteger página completa
<RoleGuard allowedRoles={['admin', 'auxiliar']}>
  <AdminContent />
</RoleGuard>

// Condicional en componente
{isAdmin && <Button>Editar</Button>}
```

## 📊 Servicios API

### Cliente HTTP
```typescript
// src/lib/api-client.ts
class ApiClient {
  async get<T>(endpoint: string): Promise<T>
  async post<T>(endpoint: string, data: any): Promise<T>
  async put<T>(endpoint: string, data: any): Promise<T>
  async delete(endpoint: string): Promise<void>
}
```

### Servicios Disponibles (17)
```typescript
// src/lib/services.ts
export const gradoService = new CrudService<Grado>('/grados');
export const seccionService = new CrudService<Seccion>('/secciones');
export const materiaService = new CrudService<Materia>('/materias');
export const estudianteService = new CrudService<Estudiante>('/estudiantes');
export const docenteService = new CrudService<Docente>('/docentes');
export const padreService = new CrudService<Padre>('/padres');
export const horarioService = new CrudService<Horario>('/horarios');
export const asistenciaService = new CrudService<Asistencia>('/asistencias');
export const calificacionService = new CrudService<Calificacion>('/calificaciones');
export const periodoService = new CrudService<PeriodoAcademico>('/periodos');
export const asignacionService = new CrudService<AsignacionDocenteMateria>('/asignaciones');
export const libroService = new CrudService<Libro>('/libros');
export const prestamoService = new CrudService<PrestamoLibro>('/prestamos');
export const eleccionService = new CrudService<Eleccion>('/elecciones');

// Portales especializados
export const docentePortalService = { ... };
export const estudiantePortalService = { ... };
export const padrePortalService = { ... };
```

## 🎯 Funcionalidades Destacadas

### 1. Secciones Dinámicas (Rediseñado)
- Vista Grid/Lista intercambiable
- Filtros por grado
- Búsqueda en tiempo real
- Estadísticas en header
- Ver estudiantes por sección
- Badges de turno coloridos

### 2. Grados Modernos (Rediseñado)
- Cards atractivos con iconos
- Estadísticas por nivel
- Ver secciones asociadas
- Validación de eliminación
- Gradientes coloridos

### 3. Dashboard por Rol
- **Admin**: Estadísticas globales, gráficos, acceso total
- **Docente**: Mis clases, estudiantes pendientes, calendario
- **Estudiante**: Mis notas recientes, horarios, próximas evaluaciones
- **Padre**: Resumen de hijos, alertas, comunicados

### 4. Portal Docente
- Mis asignaciones (materias y secciones)
- Mis estudiantes agrupados
- Registro rápido de asistencias
- Registro de calificaciones
- Filtros por materia y fecha

### 5. Portal Estudiante
- Mi perfil académico
- Mis calificaciones por período
- Historial de asistencias
- Mi horario semanal
- Descargar boletín

### 6. Portal Padre
- Lista de mis hijos
- Calificaciones de todos
- Asistencias individuales
- Reportes descargables

## 🎨 Temas y Estilos

### Paleta de Colores
```css
/* Colores principales */
--primary: #04ADBF;      /* Azul turquesa */
--secondary: #F2F0CE;    /* Beige suave */
--danger: #F22727;       /* Rojo */
--success: #10B981;      /* Verde */

/* Gradientes */
.gradient-blue-purple {
  background: linear-gradient(to right, #04ADBF, #9333EA);
}

.gradient-green-teal {
  background: linear-gradient(to right, #10B981, #14B8A6);
}
```

### Iconos
SVG inline con Heroicons (24px, 2px stroke)

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo (http://localhost:3000)

# Producción
npm run build        # Compilar para producción
npm run start        # Servidor de producción

# Calidad de código
npm run lint         # Ejecutar ESLint
npm run type-check   # Verificar tipos TypeScript

# Formato
npm run format       # Formatear con Prettier
```

## 🔧 Configuración

### next.config.ts
```typescript
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
};
```

### tailwind.config.ts
```typescript
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#04ADBF',
        secondary: '#F2F0CE',
      },
    },
  },
};
```

## 📱 Responsive Design

- **Mobile First** - Diseñado primero para móviles
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Grid Responsive**: 1 col (mobile), 2 cols (tablet), 3 cols (desktop)
- **Sidebar Colapsable** en móviles
- **Tablas Horizontales** con scroll en móviles

## 🐛 Troubleshooting

### Error: "Cannot connect to API"
```bash
# Verificar que el backend esté corriendo
# Verificar NEXT_PUBLIC_API_URL en .env.local
```

### Error: "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "Type error"
```bash
npm run type-check
```

### Errores de CORS
```bash
# Verificar que el backend permita el origen del frontend
# Ver config/cors.php en el backend
```

## 📄 Licencia

Este proyecto es de código abierto bajo licencia MIT.

## 👨‍💻 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 🎯 Roadmap

- [ ] PWA (Progressive Web App)
- [ ] Notificaciones push
- [ ] Chat en tiempo real
- [ ] Videollamadas integradas
- [ ] App móvil nativa
- [ ] Modo oscuro
- [ ] Multi-idioma

## 📞 Contacto

Para soporte o consultas, contactar al equipo de desarrollo.

---

**Desarrollado con ❤️ para instituciones educativas**
