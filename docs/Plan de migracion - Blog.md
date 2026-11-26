# Plan de Migración — Proyecto Blog

> **Fecha**: 20 de julio de 2026
> **Objetivo**: Llevar el blog de un estado funcional con bugs a una arquitectura sólida, segura y mantenible.
> **Estrategia**: Migración incremental en fases. Cada fase es deployable independientemente.

---

## Fase 0 — Hotfixes (1-2 días)

> Arreglar lo que está roto AHORA sin cambiar arquitectura.

### Backend

- [ ] **Fix `Comments.js`**: Recibir `post_id` como parámetro en `insertComment` en vez de hardcodear `1`
- [ ] **Fix `Image.js`**: Agregar `image_url` como parámetro de `insertImage`
- [ ] **Fix rutas conflictivas**: Cambiar `/post/:tag` a `/post/tag/:tag` para que no colisione con `/:id`
- [ ] **Fix validación**: Agregar `.run(req)` al validador de `content` en `commentsControllers.js`
- [ ] **Fix import**: Importar `Tags` en `PostTags.js`
- [ ] **Fix naming**: `getSpecificComments` → `getSpecificComment` (o viceversa, unificar)

### Frontend

- [ ] **Fix QueryClient**: Mover `new QueryClient()` fuera del componente `App`
- [ ] **Fix InsertComments**: Usar `isSuccess`/`isError` del mutation en vez de `onSuccess`/`onError`
- [ ] **Fix invalidateQueries**: Cambiar `["comment"]` por la query key correcta del post

### Resultado: El blog funciona correctamente sin bugs de runtime.

---

## Fase 1 — Seguridad (2-3 días)

> Cerrar vulnerabilidades antes de refactorizar.

### Backend

- [ ] **JWT Secret**: Eliminar fallback. Lanzar error en startup si `JWT_SECRET` no existe:
  ```js
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  ```
- [ ] **Instalar y configurar `helmet`**:
  ```js
  import helmet from "helmet";
  app.use(helmet());
  ```
- [ ] **Instalar y configurar `express-rate-limit`** en `/login`:
  ```js
  import rateLimit from "express-rate-limit";
  const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });
  app.use("/login", loginLimiter);
  ```
- [ ] **Agregar `verifyToken`** a `POST /images/insert`
- [ ] **Limitar body size**: `app.use(express.json({ limit: '1mb' }))`
- [ ] **No exponer errores internos**: Crear middleware de error que loguee y devuelva mensaje genérico
- [ ] **Validar `image_url`**: Verificar que sea HTTPS y URL válida

### Frontend

- [ ] **Instalar `dompurify`** y sanitizar todo HTML antes de `dangerouslySetInnerHTML`:
  ```jsx
  import DOMPurify from "dompurify";
  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }} />
  ```
- [ ] **Mover credenciales de Cloudinary** a variables de entorno (`VITE_CLOUDINARY_CLOUD_NAME`, `VITE_UPLOAD_PRESET`)
- [ ] **Unificar variables de API URL**: Usar la misma estrategia en `auth.js` y `blogApi.js`

### Resultado: Las vulnerabilidades críticas están cerradas.

---

## Fase 2 — Limpieza (1-2 días)

> Eliminar código muerto y deuda técnica superficial.

### Backend — Eliminar dependencias

```bash
npm uninstall @tiptap/extension-color @tiptap/extension-document @tiptap/extension-paragraph @tiptap/extension-text @tiptap/extension-text-style axios node-cron express-session sqlite3 bcrypt
```

### Frontend — Eliminar dependencias

```bash
npm uninstall quill react-quill cloudinary react-router
```

> Nota: Dejar `react-router-dom` que re-exporta todo.

### General

- [ ] Eliminar todos los `console.log` de debug
- [ ] Eliminar `config.json` (usa `DATABASE_URL` de env)
- [ ] Eliminar imports no usados en `server.js` (`Post`, `Tags`, `PostTags`, `cron`, `axios`)
- [ ] Remover `external: ['sequelize', 'wkx']` de `vite.config.js`
- [ ] Renombrar archivos con typos: `spinnner.jsx` → `Spinner.jsx`, `creatPostComponent` → `CreatePostComponent`

### Resultado: package.json limpio, ~400KB menos de bundle en frontend, sin código muerto.

---

## Fase 3 — Migración del ORM: Sequelize → Prisma (3-5 días)

> Esta es la fase más grande. Hacerla en un branch separado.

### Paso 1: Setup de Prisma

```bash
cd backend
npm uninstall sequelize pg-hstore
npm install prisma @prisma/client
npx prisma init
```

### Paso 2: Definir el schema

Crear `prisma/schema.prisma` basado en los modelos actuales:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Post {
  id          Int       @id @default(autoincrement())
  title       String
  subtitle    String?
  content     String
  image       String?
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  comments    Comment[]
  tags        PostTag[]
  images      PostImage[]

  @@map("posts")
}

model Comment {
  id        Int      @id @default(autoincrement())
  author    String
  content   String
  postId    Int      @map("post_id")
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now()) @map("created_at")

  @@map("comments")
}

model Tag {
  id    Int       @id @default(autoincrement())
  name  String    @unique
  posts PostTag[]

  @@map("tags")
}

model PostTag {
  postId Int  @map("post_id")
  tagId  Int  @map("tag_id")
  post   Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag    Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([postId, tagId])
  @@map("post_tags")
}

model Image {
  id       Int         @id @default(autoincrement())
  imageUrl String      @map("image_url")
  posts    PostImage[]

  @@map("images")
}

model PostImage {
  postId  Int   @map("post_id")
  imageId Int   @map("image_id")
  post    Post  @relation(fields: [postId], references: [id], onDelete: Cascade)
  image   Image @relation(fields: [imageId], references: [id], onDelete: Cascade)

  @@id([postId, imageId])
  @@map("post_images")
}
```

### Paso 3: Introspect DB existente y generar migración baseline

```bash
npx prisma db pull          # Genera schema desde la DB existente
npx prisma migrate dev --name init  # Crea migración inicial
npx prisma generate         # Genera el client
```

### Paso 4: Crear capa de repositorios con Prisma

Crear `repositories/postRepository.js`:

```js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const findAllPosts = async (page, limit) => {
  const offset = (page - 1) * limit;
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      skip: offset,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { tags: { include: { tag: true } } },
    }),
    prisma.post.count(),
  ]);
  return { posts, total };
};

export const findPostById = async (id) => {
  return prisma.post.findUnique({
    where: { id },
    include: {
      comments: { orderBy: { createdAt: "desc" } },
      tags: { include: { tag: true } },
      images: { include: { image: true } },
    },
  });
};

export const createPost = async (data) => {
  return prisma.post.create({ data });
};

export const updatePost = async (id, data) => {
  return prisma.post.update({ where: { id }, data });
};

export const deletePost = async (id) => {
  return prisma.post.delete({ where: { id } });
};
```

### Paso 5: Migrar controllers uno a uno

Reemplazar las llamadas a `Post.createPost(...)` por `postRepository.createPost(...)`. Migrar un controller por vez, testear, y seguir.

### Paso 6: Eliminar archivos viejos

- Eliminar carpeta `models/` completa
- Eliminar `config/database.js` y `config/config.json`
- Eliminar `models/index.js` con sus relaciones manuales

### Resultado: ORM moderno, separación de capas natural, tipos inferidos.

---

## Fase 4 — Arquitectura: Servicios + Validación con Zod (2-3 días)

### Paso 1: Instalar Zod

```bash
npm install zod
```

### Paso 2: Crear schemas de validación

Crear `schemas/postSchemas.js`:

```js
import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  subtitle: z.string().max(300).optional(),
  content: z.string().min(1),
  image: z.string().url().optional(),
  tagIds: z.array(z.number().int().positive()).optional(),
});

export const updatePostSchema = createPostSchema.partial();

export const postIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});
```

### Paso 3: Crear middleware de validación genérico

Crear `middleware/validate.js`:

```js
export const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        timestamp: new Date().toISOString(),
        details: result.error.issues,
      });
    }
    req.validated = result.data;
    next();
  };
};
```

### Paso 4: Crear capa de servicios

Crear `services/postService.js`:

```js
import * as postRepository from "../repositories/postRepository.js";

export const getAllPosts = async (page, limit) => {
  const { posts, total } = await postRepository.findAllPosts(page, limit);
  return {
    data: posts.map(mapPostToResponse),
    count: total,
  };
};

export const getPostById = async (id) => {
  const post = await postRepository.findPostById(id);
  if (!post) throw new NotFoundError("Post not found");
  return { data: mapPostToResponse(post) };
};

export const createPost = async (data) => {
  const post = await postRepository.createPost(data);
  return { data: mapPostToResponse(post) };
};

const mapPostToResponse = (post) => ({
  id: post.id,
  title: post.title,
  subtitle: post.subtitle,
  content: post.content,
  image: post.image,
  createdAt: post.createdAt,
  tags: post.tags?.map((pt) => ({ id: pt.tag.id, name: pt.tag.name })),
  commentsCount: post.comments?.length ?? 0,
});
```

### Paso 5: Refactorizar controllers

```js
import * as postService from "../services/postService.js";
import { createPostSchema, postIdSchema } from "../schemas/postSchemas.js";
import { validate } from "../middleware/validate.js";

// En las rutas:
router.get("/", postControllers.getAllPosts);
router.get("/:id", validate(postIdSchema, "params"), postControllers.getPostById);
router.post("/", verifyToken, validate(createPostSchema), postControllers.createPost);
```

Controller limpio:

```js
export const getAllPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const result = await postService.getAllPosts(page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
```

### Paso 6: Corregir rutas a convención REST

| Antes | Después |
|-------|---------|
| `GET /post/all` | `GET /posts` |
| `GET /post/:id` | `GET /posts/:id` |
| `POST /post/create` | `POST /posts` |
| `PUT /post/edit/:id` | `PUT /posts/:id` |
| `DELETE /post/delete/:id` | `DELETE /posts/:id` |
| `GET /post/:tag` | `GET /posts?tag=:tag` |
| `POST /comments/create` | `POST /comments` |
| `DELETE /comments/delete/:id` | `DELETE /comments/:id` |

### Resultado: Arquitectura en capas (router → controller → service → repository), validación declarativa, DTOs explícitos.

---

## Fase 5 — Frontend: Mejoras de performance y UX (2-3 días)

### Paso 1: Eliminar TipTap para display

Reemplazar `TruncatedEditor` en `lastPosts.jsx`:

```jsx
import DOMPurify from "dompurify";

const PostPreview = ({ htmlContent, maxLength = 150 }) => {
  const textContent = new DOMParser()
    .parseFromString(htmlContent, "text/html")
    .body.textContent || "";
  const truncated = textContent.slice(0, maxLength) + "...";
  return <p>{truncated}</p>;
};
```

### Paso 2: Fix editor re-renders en `insertPost.jsx`

Usar el patrón de `editorRef` que ya existe en `EditPost.jsx`:

```jsx
const editorRef = useRef(null);

// En el submit:
const content = editorRef.current?.getHTML();
```

### Paso 3: Reemplazar axios por fetch

Crear `src/api/fetchClient.js`:

```js
const API_URL = import.meta.env.VITE_API_URL;

export const fetchClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
};
```

### Paso 4: Accesibilidad básica

- [ ] Agregar `<label>` a todos los inputs de formularios
- [ ] Agregar `alt` descriptivo a imágenes de posts
- [ ] Agregar `aria-label` a links de redes sociales
- [ ] Agregar `disabled` a botones de paginación cuando no aplican
- [ ] Agregar `aria-live="polite"` al spinner

### Paso 5: Mover `routes/` dentro de `src/`

```
frontend/
  src/
    routes/        ← mover acá
      routes.jsx
      protectedRoutes.jsx
```

### Resultado: Frontend performante, accesible, sin dependencias innecesarias.

---

## Fase 6 — Extras opcionales (ongoing)

- [ ] Agregar logger (pino) al backend
- [ ] Configurar ESLint rule `no-console` como error
- [ ] Agregar tests unitarios a servicios con vitest/jest
- [ ] Configurar CI/CD básico (lint + test en push)
- [ ] Agregar SEO con `react-helmet-async`
- [ ] Implementar dark mode con CSS variables
- [ ] Agregar búsqueda de posts

---

## Timeline estimado

| Fase | Duración | Prioridad |
|------|----------|-----------|
| Fase 0 — Hotfixes | 1-2 días | 🔴 Inmediata |
| Fase 1 — Seguridad | 2-3 días | 🔴 Inmediata |
| Fase 2 — Limpieza | 1-2 días | 🟠 Esta semana |
| Fase 3 — Prisma | 3-5 días | 🟠 Semana 2 |
| Fase 4 — Servicios + Zod | 2-3 días | 🟡 Semana 2-3 |
| Fase 5 — Frontend | 2-3 días | 🟡 Semana 3 |
| Fase 6 — Extras | Ongoing | 🟢 Cuando se pueda |

**Total estimado**: ~2-3 semanas trabajando de forma incremental.

---

## Estrategia de Branching

> Modelo híbrido: trunk-based (estilo NBA/GitHub Flow) + tags versionados (estilo GitFlow).

### Ramas permanentes

| Rama | Propósito |
|------|-----------|
| `main` | Producción. Siempre deployable. Solo se mergea vía PR. |
| `develop` | Integración. Acá se mergean las feature branches antes de ir a main. |

### Ramas temporales (prefijo por tipo)

| Prefijo | Uso | Ejemplo |
|---------|-----|---------|
| `feature/` | Funcionalidad nueva | `feature/search-posts` |
| `fix/` | Corrección de bugs | `fix/comment-post-id` |
| `refactor/` | Cambio estructural sin cambiar comportamiento | `refactor/prisma-migration` |
| `security/` | Fixes de seguridad | `security/jwt-secret-validation` |
| `chore/` | Limpieza, dependencias, config | `chore/remove-dead-deps` |

### Tags (versionado semántico)

Cada merge a `main` se tagea con versión semántica:

```
v0.1.0  → Fase 0 completada (hotfixes, blog funcional)
v0.2.0  → Fase 1 completada (seguridad)
v0.3.0  → Fase 2 completada (limpieza)
v1.0.0  → Fase 3+4 completadas (Prisma + arquitectura nueva)
v1.1.0  → Fase 5 completada (frontend optimizado)
```

Regla de versionado:
- **MAJOR** (x.0.0): Cambio breaking o refactor grande (ej: migración de ORM)
- **MINOR** (0.x.0): Feature nueva o fase completada
- **PATCH** (0.0.x): Hotfix puntual en producción

### Flujo de trabajo

```
main ─────●────────────●────────────●──── (tags: v0.1.0, v0.2.0, etc.)
           ↑            ↑            ↑
develop ──●──●──●──────●──●────────●──── (integración)
          ↑  ↑  ↑      ↑  ↑        ↑
          │  │  │      │  │        │
          │  │  └─ fix/comment-post-id
          │  └─── fix/image-insert
          └────── fix/route-conflict
                       │  │
                       │  └─ security/rate-limiting
                       └─── security/jwt-validation
```

### Reglas

1. **Nunca pushear directo a `main` ni a `develop`** — siempre vía PR/merge.
2. **Una rama = un cambio lógico**. No mezclar fix + feature en la misma rama.
3. **Ramas cortas**: Mergear seguido a `develop`. No dejar branches vivos más de 3-4 días.
4. **Tagear después de cada merge a `main`**: `git tag -a v0.x.0 -m "descripción"`.
5. **Hotfixes urgentes**: Branch `fix/` desde `main`, mergear a `main` Y a `develop`.

### Branches para este plan de migración

```bash
# Fase 0
fix/comment-post-id-hardcoded
fix/image-insert-param
fix/route-tag-conflict
fix/comment-validation-run
fix/posttags-import
fix/frontend-queryclient
fix/insert-comments-feedback
fix/invalidate-queries

# Fase 1
security/jwt-secret-validation
security/helmet-rate-limit
security/verify-token-images
security/body-size-limit
security/error-middleware
security/frontend-xss-sanitize
security/cloudinary-env-vars

# Fase 2
chore/remove-dead-backend-deps
chore/remove-dead-frontend-deps
chore/cleanup-console-logs
chore/rename-typos

# Fase 3
refactor/prisma-setup
refactor/prisma-repositories
refactor/prisma-migrate-controllers
refactor/remove-sequelize-models

# Fase 4
refactor/zod-schemas
refactor/validation-middleware
refactor/services-layer
refactor/rest-routes-convention

# Fase 5
refactor/frontend-remove-tiptap-display
refactor/frontend-editor-performance
refactor/frontend-fetch-client
feature/frontend-accessibility
chore/frontend-move-routes-to-src
```

### Comandos útiles

```bash
# Crear branch desde develop
git checkout develop
git pull
git checkout -b fix/comment-post-id-hardcoded

# Mergear a develop (local, o vía PR en GitHub)
git checkout develop
git merge --no-ff fix/comment-post-id-hardcoded
git push

# Cuando la fase está completa, mergear develop a main y tagear
git checkout main
git merge --no-ff develop
git tag -a v0.1.0 -m "Fase 0: Hotfixes - blog funcional sin bugs"
git push --follow-tags

# Eliminar branch mergeada
git branch -d fix/comment-post-id-hardcoded
```

---

## Notas importantes

1. **Cada fase es deployable**: Después de la Fase 0 ya tenés un blog funcional sin bugs.
2. **Testear en cada paso**: Antes de mergear a develop, verificar que la funcionalidad existente no se rompe.
3. **La Fase 3 (Prisma) es la más riesgosa**: Hacerla con una DB de staging, no directo en producción. Usar `prisma db pull` para generar el schema desde la DB existente.
4. **Frontend puede hacerse en paralelo**: La Fase 5 no depende de las Fases 3-4 del backend (salvo los nuevos endpoints REST).
5. **Agrupar PRs de la misma fase**: Los fixes de la Fase 0 pueden mergearse rápido uno tras otro. No hace falta esperar entre ellos.
