# Sistema de Gestión Escolar - Frontend

Sistema web moderno para la gestión integral de instituciones educativas. Desarrollado con Next.js 16, React 19 y TypeScript.

## 🚀 Tecnologías

- **Framework**: Next.js 16.0.10 (App Router + Turbopack)
- **UI Library**: React 19.2.0
- **Lenguaje**: TypeScript 5
- **Estilos**: Tailwind CSS 4
- **Autenticación**: Laravel Sanctum (API Tokens)
- **Cliente HTTP**: Fetch API nativo

## 📋 Estado Actual del Proyecto

### ✅ Funcionalidades Implementadas

#### Autenticación y Seguridad
- ✅ Sistema de login con JWT/Sanctum tokens
- ✅ Protección de rutas con middleware
- ✅ Gestión de sesiones con localStorage
- ✅ Auto-logout en caso de token expirado
- ✅ Context API para estado de autenticación global
- ✅ Redirección automática basada en estado de autenticación

#### Arquitectura y Estructura
- ✅ Arquitectura basada en features (feature-based architecture)
- ✅ Sistema de componentes UI reutilizables
- ✅ API Client centralizado con interceptores
- ✅ Manejo de errores consistente
- ✅ Tipos TypeScript para toda la aplicación
- ✅ Configuración de constantes centralizadas

#### Componentes UI Base
- ✅ Button - Botones con variantes y estados
- ✅ Input - Campos de formulario con validación
- ✅ Card - Contenedores con sombras personalizables
- ✅ Alert - Alertas de éxito, error, warning, info
- ✅ Table - Tablas responsivas con paginación
- ✅ Modal - Ventanas modales reutilizables
- ✅ Toast - Notificaciones temporales

#### Layout y Navegación
- ✅ Layout principal del dashboard
- ✅ Sidebar con navegación por módulos
- ✅ Navbar con información de usuario
- ✅ Diseño responsive para móviles y tablets

#### Páginas Implementadas
- ✅ `/login` - Página de inicio de sesión
- ✅ `/dashboard` - Dashboard principal
- ✅ `/dashboard/estudiantes` - Gestión de estudiantes
- ✅ `/dashboard/docentes` - Gestión de docentes
- ✅ `/dashboard/padres` - Gestión de padres de familia
- ✅ `/dashboard/grados` - Gestión de grados académicos
- ✅ `/dashboard/secciones` - Gestión de secciones
- ✅ `/dashboard/materias` - Gestión de materias
- ✅ `/dashboard/horarios` - Gestión de horarios
- ✅ `/dashboard/asistencias` - Registro de asistencias
- ✅ `/dashboard/calificaciones` - Registro de calificaciones
- ✅ `/dashboard/periodos` - Gestión de períodos académicos

### 🔧 Configuración

#### Variables de Entorno (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME="Sistema Colegio"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

#### Credenciales de Prueba
```
Email:    admin@colegio.pe
Password: password

Email:    docente@colegio.pe
Password: password
```

## 🚀 Instalación y Ejecución

### Prerrequisitos
- Node.js 20+ 
- npm o yarn
- Backend Laravel ejecutándose en http://localhost:8000

### Pasos de Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con la URL del backend

# 3. Ejecutar en desarrollo
npm run dev

# 4. Compilar para producción
npm run build

# 5. Ejecutar en producción
npm start
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
frontend-colegio/
├── app/                          # App Router de Next.js
│   ├── (auth)/                   # Grupo de rutas de autenticación
│   │   └── login/                # Página de login
│   ├── dashboard/                # Rutas del dashboard
│   │   ├── estudiantes/          # Gestión de estudiantes
│   │   ├── docentes/             # Gestión de docentes
│   │   ├── padres/               # Gestión de padres
│   │   ├── grados/               # Gestión de grados
│   │   ├── secciones/            # Gestión de secciones
│   │   ├── materias/             # Gestión de materias
│   │   ├── horarios/             # Gestión de horarios
│   │   ├── asistencias/          # Registro de asistencias
│   │   ├── calificaciones/       # Registro de calificaciones
│   │   └── periodos/             # Períodos académicos
│   ├── layout.tsx                # Layout raíz
│   ├── page.tsx                  # Página principal
│   └── globals.css               # Estilos globales
│
├── src/
│   ├── components/               # Componentes reutilizables
│   │   ├── layout/               # Componentes de layout
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── Sidebar.tsx
│   │   └── ui/                   # Componentes UI base
│   │       ├── Alert.tsx
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── Table.tsx
│   │       └── Toast.tsx
│   │
│   ├── features/                 # Features por dominio
│   │   └── auth/                 # Feature de autenticación
│   │       ├── components/       # Componentes de auth
│   │       ├── hooks/            # Hooks personalizados
│   │       └── services/         # Servicios de API
│   │
│   ├── lib/                      # Utilidades y librerías
│   │   ├── api-client.ts         # Cliente HTTP centralizado
│   │   ├── services.ts           # Servicios base
│   │   └── utils.ts              # Funciones auxiliares
│   │
│   ├── types/                    # Tipos TypeScript
│   │   ├── index.ts              # Tipos generales
│   │   └── models.ts             # Modelos de datos
│   │
│   └── config/                   # Configuración
│       └── constants.ts          # Constantes de la app
│
├── public/                       # Archivos estáticos
├── docs/                         # Documentación
│   └── SETUP.md                  # Guía de configuración
├── .env.local                    # Variables de entorno
├── next.config.ts                # Configuración de Next.js
├── tailwind.config.ts            # Configuración de Tailwind
├── tsconfig.json                 # Configuración de TypeScript
└── package.json                  # Dependencias
```

## 🎯 Mejoras Futuras Planificadas

### Prioridad Alta 🔴

#### 1. CRUD Completo de Módulos
- [ ] Implementar formularios de creación para todos los módulos
- [ ] Añadir funcionalidad de edición inline en tablas
- [ ] Implementar confirmaciones de eliminación
- [ ] Validación de formularios con react-hook-form o zod
- [ ] Búsqueda y filtrado avanzado en todas las tablas

#### 2. Gestión de Datos Completa
- [ ] **Estudiantes**: CRUD completo con asignación de padres
- [ ] **Docentes**: CRUD con asignación de materias
- [ ] **Asistencias**: Sistema de registro diario masivo
- [ ] **Calificaciones**: Entrada y edición de notas por período
- [ ] **Horarios**: Generador automático de horarios

#### 3. Mejoras en Autenticación
- [ ] Recuperación de contraseña
- [ ] Cambio de contraseña desde perfil
- [ ] Sistema de roles y permisos (RBAC)
- [ ] Refresh token automático
- [ ] Sesiones concurrentes limitadas

### Prioridad Media 🟡

#### 4. Dashboard Mejorado
- [ ] Gráficos y estadísticas (Chart.js o Recharts)
- [ ] Widgets personalizables
- [ ] Resumen de asistencias del día
- [ ] Alertas de estudiantes con bajo rendimiento
- [ ] Calendario de eventos académicos

#### 5. Reportes y Exportación
- [ ] Generación de reportes en PDF
- [ ] Exportación de datos a Excel/CSV
- [ ] Reportes de asistencia por estudiante/materia
- [ ] Boletines de calificaciones imprimibles
- [ ] Reportes estadísticos personalizados

#### 6. Experiencia de Usuario
- [ ] Loading skeletons en lugar de spinners
- [ ] Optimistic updates en formularios
- [ ] Infinite scroll en listas largas
- [ ] Búsqueda con debounce y autocompletado
- [ ] Modo oscuro (dark mode)
- [ ] Animaciones y transiciones suaves

#### 7. Optimización de Performance
- [ ] Implementar React Query o SWR para cache de datos
- [ ] Code splitting por rutas
- [ ] Lazy loading de componentes pesados
- [ ] Optimización de imágenes con next/image
- [ ] Service Worker para offline support

### Prioridad Baja 🟢

#### 8. Funcionalidades Avanzadas
- [ ] Sistema de mensajería interna
- [ ] Notificaciones en tiempo real (WebSockets)
- [ ] Biblioteca virtual (gestión de libros)
- [ ] Sistema de votaciones estudiantiles
- [ ] Portal de pagos de pensiones
- [ ] App móvil con React Native

#### 9. Internacionalización
- [ ] Soporte multi-idioma (i18n)
- [ ] Formato de fechas por región
- [ ] Monedas múltiples para pagos

#### 10. Testing
- [ ] Tests unitarios con Jest
- [ ] Tests de integración con React Testing Library
- [ ] Tests E2E con Playwright o Cypress
- [ ] Cobertura de código > 80%

#### 11. DevOps y Deploy
- [ ] CI/CD con GitHub Actions
- [ ] Docker containerization
- [ ] Deploy en Vercel o AWS
- [ ] Monitoreo con Sentry
- [ ] Analytics con Google Analytics o Mixpanel

## 🐛 Problemas Conocidos y Soluciones

### ✅ Resueltos
- **Error de hidratación React**: Solucionado moviendo viewport a exportación separada
- **CORS en API**: Configurado correctamente en backend
- **Rutas de autenticación no encontradas**: AuthController creado y rutas agregadas
- **HasApiTokens faltante**: Trait agregado al modelo User

### 🔍 Por Resolver
- [ ] Mejorar manejo de errores de red
- [ ] Implementar retry logic en llamadas API
- [ ] Optimizar re-renders innecesarios
- [ ] Mejorar accesibilidad (a11y) en todos los componentes

## 📚 Recursos y Documentación

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Guía de Configuración del Sistema](./docs/SETUP.md)

## 🤝 Contribución

Para contribuir al proyecto:

1. Crear un branch para la feature: `git checkout -b feature/nombre-feature`
2. Commit de cambios: `git commit -m 'Add: nueva feature'`
3. Push al branch: `git push origin feature/nombre-feature`
4. Crear Pull Request

## 📝 Convenciones de Código

- Usar TypeScript para todo el código
- Seguir guía de estilo de Airbnb
- Componentes en PascalCase
- Funciones y variables en camelCase
- Constantes en UPPER_SNAKE_CASE
- Comentar código complejo
- Tipos explícitos en funciones públicas

## 📄 Licencia

Este proyecto es privado y confidencial.

---

**Última actualización**: 16 de diciembre de 2025  
**Versión**: 1.0.0  
**Estado**: En Desarrollo Activo 🚧
