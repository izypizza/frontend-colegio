# Sistema de Gestion Escolar - Frontend

Aplicacion web en Next.js (App Router) y TypeScript para los portales de todos los roles del sistema escolar. Consume la API Laravel del backend y ofrece dashboards, CRUDs, graficas y flujos completos de asistencia, calificaciones, biblioteca y elecciones.

## Stack

- Next.js 16 (App Router), React 19, TypeScript 5
- Tailwind CSS 4, Recharts 3.6, Shepherd.js para guiado
- Autenticacion por JWT emitido por Sanctum (Bearer en peticiones al backend)

## Requisitos

- Node 20+
- Backend corriendo en http://localhost:8000 (con CORS y Sanctum configurados)

## Puesta en marcha

1. Instalar dependencias:

```
npm install
```

2. Crear `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NODE_ENV=development
```

3. Desarrollo:

```
npm run dev   # http://localhost:3000
```

4. Produccion:

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

Usuarios adicionales generados: docente{n}@colegio.pe, padre{n}@colegio.pe, estudiante{n}@colegio.pe (contrasena igual al sufijo).

## Modulos principales

- Autenticacion y pagina de mantenimiento
- Dashboard por rol (admin/auxiliar, docente, estudiante, padre)
- Gestion academica: grados, secciones, materias, periodos, horarios
- Gestion de usuarios: estudiantes, docentes, padres, usuarios del sistema
- Calificaciones: registro, filtros y graficas (barras, radar, donut, linea)
- Asistencias: registro por materia con 3 estados y reportes
- Biblioteca: libros y prestamos con estados pendiente/aprobado/rechazado/devuelto
- Elecciones estudiantiles: configuracion, candidatos, voto unico y resultados
- Configuraciones: modo mantenimiento y permisos auxiliares
- Chat y notificaciones (segun roles disponibles)

## Estructura relevante

```
app/
  (auth)/login/            # acceso
  maintenance/             # pagina de mantenimiento
  dashboard/               # rutas protegidas y modulos
    asistencias/, biblioteca/, calificaciones/, elecciones/, configuraciones/
    docente/, estudiante/, padre/, usuarios/, grados/, secciones/, materias/, etc.
src/
  components/              # layout y UI reutilizable
  config/constants.ts      # constantes globales
  contexts/ThemeContext.tsx
  hooks/                   # helpers de UI/estado
  lib/api-client.ts        # cliente HTTP
  lib/services.ts          # endpoints agrupados
  types/                   # tipados compartidos
```

## Notas de integracion

- Las rutas protegidas esperan header "Authorization: Bearer <token>" emitido por el backend (Sanctum JWT bridge).
- Si ves 401/403, verifica expiracion de token y permisos de rol; el sidebar se ajusta al rol del usuario.
- Para CORS/CSRF, asegura que SANCTUM_STATEFUL_DOMAINS=localhost:3000 y APP_URL coincidan en el backend.
