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

## Setup local

### Requisitos
- Node.js 18+
- PostgreSQL (remoto o local)

### Backend

```bash
cd backend
npm install
npx prisma generate
```

Crear `backend/.env`:
```
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
JWT_SECRET="un-secret-largo-y-seguro"
PORT=3000
ADMIN_USER="tu_usuario"
ADMIN_PASSWORD="hash_bcrypt_del_password"
```

Iniciar:
```bash
node server.js
```

### Frontend

```bash
cd frontend
npm install
```

Crear `frontend/.env`:
```
VITE_API_URL=http://localhost:3000
VITE_CLOUDINARY_CLOUD_NAME=tu_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=tu_upload_preset
```

Iniciar:
```bash
npm run dev
```

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
