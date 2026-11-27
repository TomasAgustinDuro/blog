# Análisis de Dependencias — Proyecto Blog

> **Fecha**: 20 de julio de 2026

---

## Backend — Dependencias actuales

| Paquete | Versión | Estado |
|---------|---------|--------|
| express | ^4.21.2 | Reemplazable |
| express-validator | ^7.2.1 | Reemplazable |
| sequelize | ^6.37.6 | Reemplazable |
| pg / pg-hstore | ^8.14.1 / ^2.3.4 | Se mantiene con Sequelize |
| bcrypt | ^5.1.1 | Eliminar (duplicado) |
| bcryptjs | ^3.0.2 | Mantener |
| jsonwebtoken | ^9.0.2 | Reemplazable |
| cors | ^2.8.5 | Mantener ✅ |
| dotenv | ^16.4.7 | Mantener ✅ |
| @tiptap/* | ^2.11.7 | Eliminar (no pertenece al backend) |
| axios | ^1.9.0 | Eliminar (no se usa) |
| node-cron | ^4.0.7 | Eliminar (no se usa) |
| express-session | ^1.18.1 | Eliminar (auth es JWT stateless) |
| sqlite3 | ^5.1.7 | Eliminar (usa PostgreSQL) |

---

## Backend — Cambios recomendados

### Sequelize → Prisma

| Aspecto | Sequelize (actual) | Prisma (propuesto) |
|---------|-------------------|-------------------|
| Schema | Definido en JS con clases | Archivo `.prisma` declarativo |
| Migraciones | Manuales, propensas a error | Auto-generadas desde el schema |
| Tipos | Débiles, sin autocompletado real | Generados automáticamente (TypeScript-ready) |
| Queries | API verbosa, métodos estáticos | Client tipado, autocompletado en cada query |
| Patrón | Fomenta God Objects en modelos | Separa naturalmente datos de lógica |

**Impacto**: Eliminás los modelos God Object, ganás tipos, migraciones limpias, y la separación de capas se da naturalmente.

### express-validator → Zod

| Aspecto | express-validator (actual) | Zod (propuesto) |
|---------|---------------------------|-----------------|
| Sintaxis | Imperative, `.run(req)` manual | Declarativa, schemas reutilizables |
| Reusabilidad | Baja — validación acoplada al controller | Alta — schemas como DTOs |
| Tipado | Sin inferencia de tipos | Infiere tipos TypeScript del schema |
| Error handling | Manual | Unificado con `.safeParse()` |

**Impacto**: Eliminás el problema de olvidar `.run(req)`, los schemas sirven como DTOs de request, y la validación queda separada de los controllers.

### jsonwebtoken → jose

| Aspecto | jsonwebtoken | jose |
|---------|-------------|------|
| Mantenimiento | Actualizaciones lentas | Activamente mantenido |
| ESM | Requiere workarounds | Nativo |
| Crypto | Node.js crypto legacy | Web Crypto API (más seguro) |
| Tamaño | ~30KB | ~10KB |

### Express 4 → Fastify (o Express 5)

| Aspecto | Express 4 | Fastify |
|---------|-----------|---------|
| Performance | ~15K req/s | ~30K req/s |
| Async/await | Requiere wrapper manual | Nativo, errores propagados |
| Validación | Requiere middleware externo | JSON Schema integrado |
| Plugins | Middleware lineal | Sistema de plugins encapsulado |

**Nota**: Si la migración a Fastify parece mucho, Express 5 (ya stable) al menos arregla el manejo de async errors.

---

## Frontend — Dependencias actuales

| Paquete | Versión | Estado |
|---------|---------|--------|
| react / react-dom | ^19.0.0 | Mantener ✅ |
| @tanstack/react-query | ^5.72.1 | Mantener ✅ |
| @tiptap/* (editor) | ^2.11.7 | Mantener para edición ✅ |
| axios | ^1.8.4 | Reemplazable |
| react-router / react-router-dom | ^7.4.0 | Simplificar (solo react-router-dom) |
| react-icons | ^5.5.0 | Mantener o cambiar a lucide-react |
| quill / react-quill | 2.0.3 / ^2.0.0 | Eliminar (no se usa) |
| cloudinary | ^2.6.0 | Eliminar (SDK server-side) |
| @cloudinary/url-gen | ^1.21.0 | Mantener si se usa para transformaciones |

---

## Frontend — Cambios recomendados

### axios → fetch nativo

Con React Query manejando retry, cache y loading states, axios no aporta valor. Fetch nativo + un wrapper de 10 líneas es suficiente:

```js
const apiFetch = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
};
```

**Ahorro**: ~30KB de bundle.

### TipTap (para display) → DOMPurify + HTML directo

Actualmente se instancian 5 editores TipTap completos solo para mostrar previews de posts. Un editor es para *editar*, no para *mostrar*.

```jsx
import DOMPurify from "dompurify";

const PostPreview = ({ htmlContent }) => (
  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlContent) }} />
);
```

**Impacto**: Eliminás ~200KB de JS por instancia innecesaria + cerrás el vector XSS.

### react-icons → lucide-react

| Aspecto | react-icons | lucide-react |
|---------|------------|--------------|
| Tamaño | Tree-shakeable pero iconos pesados | ~1KB por ícono |
| Consistencia | Mix de estilos (FA, Material, etc.) | Estilo unificado y moderno |
| Personalización | Props básicas | Stroke width, color, size nativos |

Esto es más estético que funcional — cambiar si querés un look más limpio.

---

## Dependencias que FALTAN y deberías agregar

### Backend

| Paquete | Para qué | Prioridad |
|---------|----------|-----------|
| `helmet` | Headers de seguridad HTTP en una línea | Alta |
| `express-rate-limit` | Rate limiting en login y endpoints públicos | Alta |
| `pino` (o `winston`) | Logger estructurado (reemplaza console.log) | Media |
| `zod` | Validación de inputs + DTOs | Alta |

### Frontend

| Paquete | Para qué | Prioridad |
|---------|----------|-----------|
| `dompurify` | Sanitizar HTML antes de renderizar — elimina XSS | Crítica |
| `react-helmet-async` | Meta tags dinámicos para SEO | Media |

---

## Resumen de impacto

| Cambio | Beneficio principal |
|--------|-------------------|
| Eliminar dependencias muertas | -400KB bundle frontend, package.json limpio |
| Sequelize → Prisma | Separación de capas natural, tipos, migraciones |
| express-validator → Zod | Validación declarativa, schemas reutilizables como DTOs |
| DOMPurify para display | Cierra XSS + elimina TipTap innecesarios (-200KB/instancia) |
| Agregar helmet + rate-limit | Seguridad baseline con 2 líneas |
| fetch nativo | -30KB, sin dependencia externa innecesaria |
