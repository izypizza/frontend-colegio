# Sistema de Gestión Escolar - Frontend

Aplicación web moderna desarrollada con **Next.js 16**, **React 19** y **TypeScript** para la gestión integral de la I.E. N° 51006 "TÚPAC AMARU". Interfaz intuitiva con diseño responsive, gráficas interactivas y sistema de roles completo.

---

## Credenciales de Prueba

Para acceder al sistema, utiliza estas credenciales según el rol que desees probar:

| Rol               | Email                    | Contraseña    | Acceso     |
| ----------------- | ------------------------ | ------------- | ---------- |
| **Admin**         | admin@colegio.pe         | admin123      | Total      |
| **Auxiliar**      | auxiliar@colegio.pe      | auxiliar123   | Gestión    |
| **Bibliotecario** | bibliotecario@colegio.pe | biblio123     | Biblioteca |
| **Docente**       | docente@colegio.pe       | docente123    | Académico  |
| **Padre**         | padre@colegio.pe         | padre123      | Consulta   |
| **Estudiante**    | estudiante@colegio.pe    | estudiante123 | Personal   |

**Usuarios adicionales:**

- `docente1@colegio.pe` a `docente15@colegio.pe` (contraseña: `docente123`)
- `padre1@colegio.pe` a `padre15@colegio.pe` (contraseña: `padre123`)

> **Nota:** El enlace de "recuperar contraseña" fue removido. Para restablecer contraseñas, contactar al administrador.

---

## Características Recientes (Enero 2026)

### Sistema de Configuraciones y Accesibilidad

#### ♿ Preferencias de Accesibilidad (Todos los roles)

- **3 tamaños de fuente**: Pequeña, Normal, Grande

  - Persistencia en localStorage del navegador
  - Aplicación global con clases CSS `.font-small`, `.font-normal`, `.font-large`
  - Cambio instantáneo sin recargar página

- **Optimización para lectores de pantalla**:
  - Activación/desactivación de modo lector
  - Clase `.screen-reader` con mejoras de contraste y espaciado
  - Navegación por teclado mejorada

#### 🔧 Modo de Mantenimiento (Solo Admin)

- **Toggle de activación** en configuraciones
- **Mensaje personalizable** para usuarios durante mantenimiento
- **Acceso exclusivo para admin** durante modo mantenimiento
- **Redirección automática** al detectar código 503 en API
- **Página de mantenimiento institucional** con diseño profesional
- **Rutas de autenticación excluidas** (login, register)

#### Implementación Técnica

- **ThemeContext**: Context API para gestión de preferencias

  - `fontSize: 'small' | 'normal' | 'large'`
  - `screenReader: boolean`
  - Métodos: `setFontSize()`, `setScreenReader()`

- **API Interceptor**: Detección automática de modo mantenimiento

  - Intercepta respuestas 503 del backend
  - Redirige a `/maintenance` excepto para admins
  - Maneja errores de API con mensajes user-friendly

- **Configuraciones por rol**:
  - Admin ve: Configuraciones del sistema + Modo mantenimiento + Preferencias accesibilidad
  - Otros roles ven: Solo preferencias de accesibilidad

### Visualizaciones Interactivas (Recharts)

- **4 tipos de gráficas** en vista estudiante: barras, radar, donut, línea
- **3 tipos de gráficas** en asistencias: distribución, por materia, tendencia semanal
- **Gráficas comparativas** para padres con múltiples hijos
- **KPIs animados** con iconos y colores pedagógicos
- **Tooltips informativos** con datos contextuales

### Dashboard Mejorado por Rol

- **Portal Docente**: Dashboard con 4 KPIs, tarjetas de clases, acciones rápidas
- **Portal Estudiante**: Vista completa con gráficas de rendimiento y asistencia
- **Portal Padre**: Comparativas visuales entre hijos, análisis por período

### Mejoras Técnicas

- **API Client refactorizado** con manejo de errores mejorado
- **Services organizados** por módulo (estudiantes, docentes, padres, etc.)
- **Manejo de múltiples formatos** de respuesta del backend
- **Error handling robusto** que preserva detalles de validación
- **Tipos TypeScript completos** con nombres separados (nombres, apellido_paterno, apellido_materno)
- **Sistema de autenticación** sin recuperación automática de contraseña
- **Login simplificado** sin credenciales de prueba visibles

## Características Principales

### Interfaz Moderna

- **Diseño atractivo** con gradientes y animaciones suaves
- **Responsive** - Funciona en móvil, tablet y desktop
- **Componentes reutilizables** - Sistema de diseño consistente
- **Vistas múltiples** - Grid y lista intercambiables
- **Filtros avanzados** - Búsqueda y filtrado en tiempo real
- **Estadísticas visuales** - Cards con métricas importantes
- **Gráficas interactivas** - Recharts para análisis visual

### Sistema de Roles (6 Roles)

| Rol               | Permisos       | Funcionalidades                                                                 |
| ----------------- | -------------- | ------------------------------------------------------------------------------- |
| **Admin**         | Control total  | CRUD completo de todos los módulos, dashboard ejecutivo, reseteo de contraseñas |
| **Auxiliar**      | Administrativo | Estudiantes, padres, asistencias, calificaciones, permisos                      |
| **Bibliotecario** | Biblioteca     | Gestión completa de libros, categorías y préstamos                              |
| **Docente**       | Académico      | Dashboard con KPIs, mis clases, estudiantes, calificaciones, asistencias        |
| **Padre**         | Consulta       | Info de hijos con gráficas comparativas (notas, asistencias)                    |
| **Estudiante**    | Consulta       | Dashboard con 4 tipos de gráficas, notas, asistencias, horarios                 |

### Módulos Implementados

#### Gestión Académica

- ✅ **Grados** - Vista cards con estadísticas por nivel
- ✅ **Secciones** - Grid/Lista con capacidad y turno
- ✅ **Materias** - Catálogo completo del Currículo Nacional
- ✅ **Horarios** - Calendario por sección y día
- ✅ **Períodos Académicos** - Bimestres/Trimestres configurables

#### Gestión de Personas

- ✅ **Estudiantes** - CRUD completo con matrícula y datos completos
- ✅ **Docentes** - Perfil con especialidad y títulos
- ✅ **Padres** - Relación con estudiantes y datos de contacto
- ✅ **Asignaciones** - Docente-Materia-Sección por período

#### Sistema de Evaluación

- ✅ **Calificaciones** - Registro por período con observaciones
- ✅ **Asistencias** - Control diario con estados y justificaciones
- ✅ **Reportes** - Boletines y estadísticas visuales

#### Portales Personalizados con Visualizaciones

- ✅ **Portal Docente**
  - Dashboard con 4 KPIs animados
  - Mis clases con tarjetas visuales
  - Estudiantes por materia
  - Registro de calificaciones y asistencias
  - Acciones rápidas y recordatorios
- ✅ **Portal Estudiante**
  - 📊 **4 Tipos de Gráficas en Calificaciones**:
    - Gráfico de barras por materia
    - Radar comparativo
    - Dona de distribución
    - Línea de evolución por período
  - 📈 **3 Tipos de Gráficas en Asistencias**:
    - Dona de distribución de estados
    - Barras apiladas por materia
    - Línea de tendencia semanal
  - Tarjetas KPI con iconos
  - Filtros por período y fechas
- ✅ **Portal Padre**
  - Vista multi-hijo con separación clara
  - Gráficas comparativas por hijo
  - Barras de notas por materia
  - Radar de rendimiento
  - Estadísticas de aprobados/reprobados
  - Enlaces directos a detalles

#### Sistemas Adicionales

- ✅ **Biblioteca Digital** - Catálogo y préstamos con control de stock
- ✅ **Elecciones Escolares** - Votación estudiantil con resultados en tiempo real
- ✅ **Dashboard** - Estadísticas personalizadas por rol

## 🚀 Tecnologías

### Core

- **Next.js 16** - Framework React con App Router y Server Components
- **React 19** - Biblioteca UI con características modernas
- **TypeScript 5** - Tipado estático para código robusto
- **Tailwind CSS 4** - Framework de estilos utility-first

### Visualización de Datos

- **Recharts 3.6** - Biblioteca de gráficas para React
  - `BarChart` - Gráficos de barras simples y apiladas
  - `LineChart` - Gráficos de línea para tendencias
  - `PieChart` - Gráficos de dona para distribuciones
  - `RadarChart` - Gráficos de radar para comparativas
  - `ResponsiveContainer` - Contenedor adaptativo

### Herramientas

- **ESLint 9** - Linting de código con reglas personalizadas
- **PostCSS** - Procesamiento avanzado de CSS
- **Turbopack** - Build tool ultra rápido (next dev)

### Características de Visualización

✅ **Interactivas**: Tooltips informativos con detalles  
✅ **Responsivas**: Se adaptan automáticamente al tamaño de pantalla  
✅ **Accesibles**: Colores pedagógicos según rendimiento  
✅ **Performantes**: Renderizado optimizado  
✅ **Profesionales**: Diseño limpio y moderno

### Códigos de Color Pedagógicos

- 🟢 **Verde (16-20)**: Excelente
- 🔵 **Azul (13-15)**: Bueno
- 🟡 **Amarillo (11-12)**: Aprobado
- 🔴 **Rojo (0-10)**: Reprobado

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

| Email                 | Password | Rol        | Descripción                 |
| --------------------- | -------- | ---------- | --------------------------- |
| admin@colegio.pe      | password | Admin      | Control total del sistema   |
| auxiliar@colegio.pe   | password | Auxiliar   | Personal administrativo     |
| docente@colegio.pe    | password | Docente    | Profesor con 4 asignaciones |
| padre@colegio.pe      | password | Padre      | Padre con 2 hijos           |
| estudiante@colegio.pe | password | Estudiante | Estudiante matriculado      |

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
<RoleGuard allowedRoles={["admin", "auxiliar"]}>
  <AdminContent />
</RoleGuard>;

// Condicional en componente
{
  isAdmin && <Button>Editar</Button>;
}
```

## 📊 Servicios API

### Cliente HTTP

```typescript
// src/lib/api-client.ts
class ApiClient {
  async get<T>(endpoint: string): Promise<T>;
  async post<T>(endpoint: string, data: any): Promise<T>;
  async put<T>(endpoint: string, data: any): Promise<T>;
  async delete(endpoint: string): Promise<void>;
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
--primary: #04adbf; /* Azul turquesa */
--secondary: #f2f0ce; /* Beige suave */
--danger: #f22727; /* Rojo */
--success: #10b981; /* Verde */

/* Gradientes */
.gradient-blue-purple {
  background: linear-gradient(to right, #04adbf, #9333ea);
}

.gradient-green-teal {
  background: linear-gradient(to right, #10b981, #14b8a6);
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
    domains: ["localhost"],
  },
};
```

### tailwind.config.ts

```typescript
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#04ADBF",
        secondary: "#F2F0CE",
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

## 🔄 Refactorización de Nombres Completos

### Estructura de Formularios

Los formularios de **Estudiantes**, **Docentes** y **Padres** utilizan **3 campos separados** en lugar de un solo campo "Nombre Completo":

**Grid Responsive**:

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <Input label="Nombres" placeholder="Juan Carlos" required />
  <Input label="Apellido Paterno" placeholder="García" required />
  <Input label="Apellido Materno" placeholder="López" required />
</div>
<Input label="DNI" maxLength={8} required />
```

### Interfaces TypeScript

```typescript
// src/types/models.ts
export interface Estudiante {
  id: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  nombre_completo?: string; // Computed field from backend
  dni: string;
  fecha_nacimiento: string;
  seccion_id: number;
}

export interface Docente {
  id: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  nombre_completo?: string;
  dni: string;
  email: string;
  especialidad?: string;
}

export interface Padre {
  id: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  nombre_completo?: string;
  dni: string;
  email?: string;
  telefono?: string;
}
```

### Visualización en Tablas

```tsx
const columns = [
  {
    key: "nombre_completo",
    label: "Nombre Completo",
    render: (value: unknown, item: Estudiante) =>
      item.nombre_completo ||
      `${item.apellido_paterno} ${item.apellido_materno}, ${item.nombres}`,
  },
];
```

### Validaciones Frontend

- **Nombres**: Requerido, texto libre
- **Apellido Paterno**: Requerido, texto libre
- **Apellido Materno**: Requerido, texto libre
- **DNI**: Requerido, 8 dígitos exactos, único

### Páginas Actualizadas

- ✅ [app/dashboard/estudiantes/page.tsx](app/dashboard/estudiantes/page.tsx)
- ✅ [app/dashboard/docentes/page.tsx](app/dashboard/docentes/page.tsx)
- ✅ [app/dashboard/padres/page.tsx](app/dashboard/padres/page.tsx)

### Formato Visual

El sistema muestra automáticamente:

```
Torres Ortiz, Luciana
García Silva, Carmen
Rodríguez Vargas, Juan Carlos
```

**Formato**: Apellido Paterno + Apellido Materno + , + Nombres

## 🔐 Autenticación y Uso

### Credenciales de Acceso

| Rol                  | Email                    | Password | Permisos                  |
| -------------------- | ------------------------ | -------- | ------------------------- |
| 🔐 **Admin**         | admin@colegio.pe         | password | Control total del sistema |
| 👨‍🏫 **Docente**       | docente@colegio.pe       | password | Gestión académica         |
| 👨‍👩‍👧 **Padre**         | padre@colegio.pe         | password | Consulta de hijos         |
| 🎓 **Estudiante**    | estudiante@colegio.pe    | password | Consulta personal         |
| 📚 **Bibliotecario** | bibliotecario@colegio.pe | password | Gestión biblioteca        |

### Flujo de Autenticación

1. **Login**: El usuario ingresa email y password en `/login`
2. **Token**: Backend responde con token Sanctum
3. **Storage**: Frontend guarda token en `localStorage`
4. **Requests**: Todas las peticiones incluyen `Authorization: Bearer TOKEN`
5. **Auto-redirect**: Si el token es inválido, redirige a login

### Uso del Sistema

```bash
# 1. Iniciar backend (Laravel)
cd backend
php artisan serve

# 2. Iniciar frontend (Next.js)
cd frontend-colegio
npm run dev

# 3. Abrir navegador
http://localhost:3000/login

# 4. Iniciar sesión con admin
Email: admin@colegio.pe
Password: password
```

### Debug en Consola del Navegador

Si tienes problemas, abre DevTools (F12) y ejecuta:

```javascript
// Ver token actual
console.log("Token:", localStorage.getItem("auth_token"));

// Ver datos de usuario
console.log("User:", JSON.parse(localStorage.getItem("user_data")));

// Hacer login manual
fetch("http://localhost:8000/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "admin@colegio.pe",
    password: "password",
  }),
})
  .then((r) => r.json())
  .then((data) => {
    if (data.token) {
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user_data", JSON.stringify(data.user));
      console.log("✓ Login exitoso, recarga la página");
      location.reload();
    }
  });

// Limpiar autenticación
localStorage.removeItem("auth_token");
localStorage.removeItem("user_data");
console.log("✓ Sesión limpiada");
```

### Errores Comunes y Soluciones

#### Error 401: No autorizado

**Causa**: No hay token o token inválido  
**Solución**: Hacer login nuevamente

#### Error 403: Acceso denegado

**Causa**: Usuario no tiene permisos para esa acción  
**Solución**: Usar usuario con rol adecuado (admin para gestión completa)

#### Error al crear/editar registros

**Causa**: Token expiró o no se envía en la petición  
**Solución**:

1. Verificar token en localStorage
2. Recargar página
3. Hacer login nuevamente si es necesario

#### Redirect continuo a login

**Causa**: Token inválido o backend no responde  
**Solución**:

1. Verificar que backend esté corriendo en puerto 8000
2. Limpiar localStorage
3. Hacer login nuevamente

### API Client Architecture

El frontend usa una arquitectura en capas:

```
Components (UI)
    ↓
Services (Lógica de negocio)
    ↓
API Client (HTTP requests)
    ↓
Backend API
```

**Archivos clave:**

- `src/lib/api-client.ts`: Cliente HTTP con autenticación automática
- `src/lib/services.ts`: Services organizados por módulo
- `src/config/constants.ts`: URLs, tokens y configuración

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
