# Review Completo — Proyecto Blog

> **Stack**: React (Vite) + Node.js/Express + Sequelize + PostgreSQL
> **Fecha de review**: 20 de julio de 2026

---

## 🔴 Bugs Críticos (rompen funcionalidad)

| # | Ubicación | Problema |
|---|-----------|----------|
| 1 | `Comments.js` | `post_id: 1` hardcodeado — todos los comentarios se asignan al post 1 |
| 2 | `Image.js` | `insertImage()` usa variable `image_url` que no existe — error de runtime |
| 3 | `postRoutes.js` | `/:id` y `/:tag` son rutas idénticas — Express nunca llega a `getByTag` |
| 4 | `commentsControllers.js` | Falta `.run(req)` en validación de `content` — nunca se valida |
| 5 | `PostTags.js` | `Tags` usado en include pero no importado — explota en runtime |
| 6 | `App.jsx` (frontend) | `new QueryClient()` dentro del componente — la cache se pierde en cada render |
| 7 | `InsertComments.jsx` | `onSuccess`/`onError` desestructurados no son props de useMutation — feedback nunca se muestra |

---

## 🔴 Seguridad

### Backend

- **JWT secret con fallback hardcodeado** (`"milocosecreto"`) — debe fallar si no existe la env var
- **`/images/insert` sin `verifyToken`** — cualquiera puede insertar imágenes
- **`rejectUnauthorized: false` en SSL** — permite ataques MITM
- **Sin rate limiting en `/login`** — vulnerable a fuerza bruta
- **Sin límite de body size** en `express.json()` — DoS posible
- **Error messages exponen detalles internos** de Sequelize al cliente
- **`trust proxy` habilitado sin restricción** — posible IP spoofing
- **Sin validación de formato de `id`** en params — IDs no validados antes de llegar a la DB

### Frontend

- **XSS en `SpecificPost.jsx`** via `dangerouslySetInnerHTML` sin sanitizar
- **Token JWT en localStorage** — accesible si se explota el XSS anterior
- **Credenciales de Cloudinary hardcodeadas** (cloud name + upload preset en `MenuBar.jsx`)
- **Sin protección CSRF** — mutaciones protegidas solo con Bearer token
- **Variables de entorno inconsistentes** — `auth.js` usa `VITE_API_URL`, `blogApi.js` usa `VITE_API_URL_PROD/DEV`

---

## 🟠 Arquitectura

### Backend

1. **Sin capa de servicios**: controllers → modelos directo. Los modelos Sequelize son God Objects con toda la lógica de negocio.
2. **Sin DTOs**: Las entidades de la DB se retornan directamente al cliente (createdAt, updatedAt, IDs internos expuestos).
3. **Rutas con verbos** (anti-REST):
   - `/post/create` → debería ser `POST /posts`
   - `/post/edit/:id` → debería ser `PUT /posts/:id`
   - `/post/delete/:id` → debería ser `DELETE /posts/:id`
4. **Validación inline** en cada controller — debería estar en middlewares separados.
5. **`config.json` inconsistente** con `database.js` — dice sqlite pero usa PostgreSQL.
6. **Dependencias de frontend en el backend** (paquetes de TipTap en package.json).
7. **Dependencia duplicada** de bcrypt (`bcrypt` + `bcryptjs`).
8. **Código muerto**: `cron`, `axios`, `express-session`, `sqlite3` importados/instalados pero sin uso.

### Frontend

1. **QueryClient recreado en cada render** — pérdida total de cache.
2. **5 instancias de TipTap** solo para mostrar texto truncado en `lastPosts.jsx` — performance severa.
3. **`setContent` en cada keystroke** en `insertPost.jsx` — re-renders innecesarios.
4. **Carpeta `routes/` fuera de `src/`** — rompe convención de Vite.
5. **`useDeleteComment` invalida query key `["comment"]`** que no existe — UI no se actualiza al borrar.
6. **Upload a Cloudinary sin error handling** en MenuBar.

---

## 🟡 Código y Calidad

### Naming inconsistente

- `spinnner.jsx` — typo (triple 'n')
- `creatPostComponent/` — falta la 'e' en "create"
- Componentes en minúscula: `navbar.jsx`, `lastPosts.jsx`, `pagination.jsx`
- Mezcla español/inglés en CSS: `contenedorTags` vs `comments`
- Backend: `currentsPage` (typo), `getSpecificComments` vs controller llama `getSpecificComment`
- Mensajes de error mezclados español/inglés

### Código muerto

- `console.log` de debug en producción (backend y frontend)
- Dependencias muertas: `quill`, `react-quill`, `cloudinary` SDK, `bcrypt`, `node-cron`, `axios` (backend)
- `config.json` con sqlite que no se usa
- Imports no usados en `server.js` (`Post`, `Tags`, `PostTags`, `cron`, `axios`)

### Accesibilidad

- Formularios sin `<label>` (Login, InsertComments)
- Imágenes sin `alt` text descriptivo
- Links de redes sociales sin `aria-label`
- Botones de paginación sin estado `disabled`
- Spinners sin `aria-live` o `role="status"`
- Botones dentro de NavLink (interactive inside interactive)

---

## 🟢 Cosas que están bien

- Uso de React Query para data fetching
- Separación frontend/backend
- Uso de TipTap para edición (buena elección de editor)
- Middleware de auth separado
- CSS Modules para estilos

---

## 📋 Orden de acción sugerido

1. **Primero**: Arreglar los 7 bugs críticos (rápidos y rompen funcionalidad)
2. **Segundo**: Securizar (JWT sin fallback, rate limiting, sanitizar HTML)
3. **Tercero**: Refactorizar arquitectura (crear servicios, DTOs, fix rutas REST)
4. **Cuarto**: Limpiar código (dependencias muertas, console.logs, naming)
5. **Quinto**: Features nuevas sobre la base sólida

---

## 💡 Features sugeridas

1. Búsqueda de posts por título, contenido o tags
2. Categorías/Tags clickeables — filtrar posts por tag
3. Paginación en comentarios
4. Draft/Borrador — guardar posts sin publicar
5. Likes o reacciones en posts
6. Compartir en redes sociales
7. SEO — meta tags dinámicos, sitemap, Open Graph
8. RSS feed
9. Notificaciones al admin cuando llega un comentario nuevo
10. Editor con auto-save
11. Upload de imágenes optimizado (resize/compress)
12. Dark mode
13. Vista previa del post antes de publicar
14. Sistema de roles — múltiples autores
15. Analytics básico — posts más vistos
