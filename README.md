# Blog Personal — Tomás Duro

Blog personal con panel de administración para crear, editar y eliminar posts con editor rich-text, sistema de tags e imágenes.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19, Vite, TanStack Query, TipTap (editor), CSS Modules |
| Backend | Node.js, Express, Prisma (PostgreSQL), Zod, JWT |
| Base de datos | PostgreSQL (remota) |
| Deploy | Vercel (frontend) + Render (backend) |

## Estructura del proyecto

```
blog/
├── backend/
│   ├── controllers/       # Handlers HTTP (reciben req/res)
│   ├── services/          # Lógica de negocio
│   ├── repositories/      # Acceso a datos (Prisma queries)
│   ├── schemas/           # Validación con Zod
│   ├── middleware/        # Auth, validación, error handler
│   ├── routes/            # Definición de endpoints REST
│   ├── prisma/            # Schema de Prisma y migraciones
│   └── server.js          # Entry point
├── frontend/
│   ├── src/
│   │   ├── api/           # fetchClient + React Query hooks
│   │   ├── auth/          # Login hook + AuthContext
│   │   ├── components/    # Componentes reutilizables
│   │   ├── context/       # Contextos de React (Images)
│   │   ├── pages/         # Páginas (admin + public)
│   │   ├── routes/        # Configuración de rutas
│   │   └── sources/       # Assets estáticos (logo, favicon)
│   └── index.html
└── README.md
```

## Arquitectura del backend

El backend sigue una arquitectura en capas:

```
Request → Route → Middleware (auth + validate) → Controller → Service → Repository → Prisma → DB
```

- **Routes**: definen endpoints REST y aplican middlewares
- **Controllers**: extraen datos del request y delegan al servicio
- **Services**: lógica de negocio, validaciones de dominio, mapeo de respuestas
- **Repositories**: queries puras a la DB usando Prisma Client

## API Endpoints

### Posts
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/posts` | Listar posts paginados | No |
| GET | `/posts/:id` | Obtener post por ID | No |
| GET | `/posts/tag/:tag` | Filtrar posts por tag | No |
| POST | `/posts` | Crear post | Sí |
| PUT | `/posts/:id` | Editar post | Sí |
| DELETE | `/posts/:id` | Eliminar post | Sí |

### Comments
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/comments` | Listar comentarios | No |
| GET | `/comments/:id` | Obtener comentario | No |
| POST | `/comments/:postId` | Crear comentario en un post | No |
| DELETE | `/comments/:id` | Eliminar comentario | Sí |

### Images
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/images` | Subir imagen | Sí |
| PUT | `/images/:id` | Actualizar URL | Sí |
| DELETE | `/images/:id` | Eliminar imagen | Sí |

### Auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/login` | Autenticación (devuelve JWT) |
| GET | `/me` | Obtener usuario actual |

### Formato de errores

Todos los errores responden con el mismo formato. `error` es un mensaje en
español pensado para mostrarse al usuario y nunca incluye datos internos (SQL,
tablas, stack). `code` es estable y sirve para decidir en el frontend.

```json
{
  "error": "El título no puede superar los 100 caracteres",
  "code": "VALIDATION_ERROR",
  "details": [{ "field": "title", "message": "El título no puede superar los 100 caracteres" }],
  "timestamp": "2026-11-26T18:00:00.000Z"
}
```

| Status | `code` | Cuándo |
|--------|--------|--------|
| 400 | `VALIDATION_ERROR` | Datos inválidos (`details` indica el campo) |
| 400 | `INVALID_JSON` / `INVALID_REFERENCE` | JSON mal formado / imagen inexistente |
| 401 | `AUTH_REQUIRED`, `TOKEN_EXPIRED`, `INVALID_TOKEN`, `INVALID_CREDENTIALS` | Sesión o login |
| 404 | `NOT_FOUND` / `ROUTE_NOT_FOUND` | Recurso o ruta inexistente |
| 409 | `CONFLICT` | Datos duplicados |
| 413 | `PAYLOAD_TOO_LARGE` | Cuerpo mayor a 1 MB |
| 429 | `TOO_MANY_REQUESTS` | Demasiados intentos (login o comentarios) |
| 503 | `SERVICE_UNAVAILABLE` | Base de datos no disponible |
| 500 | `INTERNAL_ERROR` | Error inesperado (el detalle queda solo en el log) |

## Setup local

### Requisitos
- Node.js 20+ (ver `.nvmrc`)
- PostgreSQL (remoto o local)

### Backend

```bash
cd backend
npm install   # ejecuta prisma generate automáticamente (postinstall)
```

Crear `backend/.env`:
```
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
JWT_SECRET="un-secret-largo-y-seguro"
PORT=3000
ADMIN_USER="tu_usuario"
ADMIN_PASSWORD="hash_bcrypt_del_password"
CORS_ORIGINS="http://localhost:5173"
```

Hay un ejemplo en `backend/.env.example`. El servidor valida estas variables al
arrancar y falla con un mensaje claro si falta alguna. `CORS_ORIGINS` acepta
varios orígenes separados por coma (en producción, la URL del frontend).

Iniciar:
```bash
npm run dev     # desarrollo, con recarga automática
npm start       # producción
```

### Frontend

```bash
cd frontend
npm install
```

Crear `frontend/.env`:
```
VITE_API_URL=http://localhost:3000
VITE_SITE_URL=http://localhost:5173
VITE_CLOUDINARY_CLOUD_NAME=tu_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=tu_upload_preset
```

`VITE_API_URL` y `VITE_SITE_URL` son obligatorias: `npm run dev` y `npm run build`
fallan con un mensaje claro si falta alguna. `VITE_SITE_URL` es la URL pública
del frontend, sin barra final (en producción, la de Vercel).

Iniciar:
```bash
npm run dev
npm test        # tests unitarios (vitest)
```

## Open Graph (vista previa al compartir links)

WhatsApp, LinkedIn, X, Facebook, Telegram y Discord no ejecutan JavaScript, así
que solo leen las etiquetas del HTML inicial:

- **Etiquetas por defecto** en `frontend/index.html`, entre los marcadores
  `<!-- open-graph:start -->` y `<!-- open-graph:end -->` (no borrarlos). Imagen:
  `frontend/public/og-default.png` (1200×630).
- **Tarjeta por post**: `frontend/middleware.js` (Routing Middleware de Vercel)
  atiende `/post/:id`. Si el User-Agent es un crawler de vista previa, pide el
  post a la API y reemplaza el bloque con título, resumen (160 caracteres),
  primera imagen del post y URL. Los visitantes reciben la SPA sin cambios.
- Si la API no responde en 2,5 s (por ejemplo, Render despertando) o el post no
  existe, se usan las etiquetas por defecto.
- La lógica está en `frontend/seo/openGraph.js`, con tests en `frontend/tests/`.

En Vercel deben existir `VITE_API_URL` y `VITE_SITE_URL`: el build las usa y el
middleware las lee en tiempo de ejecución.

Para probar en producción: [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/),
[LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) o
`curl -A "WhatsApp/2.23" https://<sitio>/post/<id>`. Las redes guardan la
tarjeta en caché: después de editar un post, usá el debugger para refrescarla.

## Seguridad

- JWT para autenticación (sin fallback inseguro)
- Helmet para headers HTTP
- Rate limiting en login (5 intentos / 15 min)
- Body size limitado a 1MB
- DOMPurify para sanitizar HTML renderizado
- Credenciales en variables de entorno
- Error handler que no expone detalles internos

## Versionado

El proyecto usa semver con tags en `main`:

```
v0.0.0 → Estado original
v0.1.0 → Hotfixes
v0.2.0 → Seguridad
v0.3.0 → Limpieza de dependencias
v0.4.0 → Migración a Prisma
v1.0.0 → Arquitectura completa (Prisma + Servicios + Zod + REST)
v1.1.0 → Frontend optimizado
```

## Branching

- `main` — producción, siempre deployable
- `develop` — integración
- `feature/*` — funcionalidad nueva
- `fix/*` — corrección de bugs
- `refactor/*` — cambios estructurales
- `security/*` — fixes de seguridad
- `chore/*` — limpieza y mantenimiento
