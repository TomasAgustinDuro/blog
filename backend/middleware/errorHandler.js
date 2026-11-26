import { HttpError } from "../lib/httpError.js";

const INTERNAL_ERROR_MESSAGE =
  "Ocurrió un error inesperado en el servidor. Intentá de nuevo más tarde.";
const SERVICE_UNAVAILABLE_MESSAGE =
  "El servicio no está disponible en este momento. Intentá de nuevo en unos minutos.";

// Mensajes por modelo de Prisma para registros inexistentes (P2025)
const NOT_FOUND_MESSAGE_BY_MODEL = {
  posts: "El post no existe",
  comments: "El comentario no existe",
  images: "La imagen no existe",
  tags: "El tag no existe",
};

/** Traduce errores de express.json (JSON mal formado, cuerpo muy grande). */
const fromBodyParserError = (err) => {
  if (err.type === "entity.parse.failed") {
    return new HttpError(400, "INVALID_JSON", "El cuerpo de la solicitud no es un JSON válido");
  }
  if (err.type === "entity.too.large") {
    return new HttpError(
      413,
      "PAYLOAD_TOO_LARGE",
      "El contenido enviado supera el tamaño máximo permitido (1 MB)"
    );
  }
  return null;
};

/**
 * P2003: clave foránea inválida. El nombre de la constraint solo se usa para
 * elegir el mensaje; nunca se envía al cliente. Según la versión de Prisma
 * viene en `meta.constraint` o en `meta.field_name`.
 */
const fromForeignKeyError = (err) => {
  const constraintName = String(err.meta?.constraint ?? err.meta?.field_name ?? "");
  if (constraintName.includes("post_id")) {
    return new HttpError(404, "NOT_FOUND", "El post indicado no existe");
  }
  if (constraintName.includes("image_id")) {
    return new HttpError(400, "INVALID_REFERENCE", "Alguna de las imágenes indicadas no existe");
  }
  return new HttpError(400, "INVALID_REFERENCE", "Algún elemento relacionado no existe");
};

/** Traduce errores conocidos de Prisma sin exponer tablas, índices ni SQL. */
const fromPrismaError = (err) => {
  if (err.code === "P2025") {
    const message = NOT_FOUND_MESSAGE_BY_MODEL[err.meta?.modelName];
    return new HttpError(404, "NOT_FOUND", message ?? "El recurso solicitado no existe");
  }
  if (err.code === "P2003") return fromForeignKeyError(err);
  if (err.code === "P2002") {
    return new HttpError(409, "CONFLICT", "Ya existe un elemento con esos datos");
  }
  // P1xxx: errores de conexión con la base de datos
  const isDatabaseUnavailable =
    err.name === "PrismaClientInitializationError" || /^P1\d{3}$/.test(err.code ?? "");
  if (isDatabaseUnavailable) {
    return new HttpError(503, "SERVICE_UNAVAILABLE", SERVICE_UNAVAILABLE_MESSAGE);
  }
  return null;
};

/**
 * Convierte cualquier error en un HttpError con mensaje seguro.
 *
 * Los errores 4xx de librerías se responden con un mensaje genérico para no
 * reenviar textos internos; el resto termina como 500.
 *
 * @param {unknown} err - Error capturado.
 * @returns {HttpError} Error listo para responder.
 */
export const toHttpError = (err) => {
  if (err instanceof HttpError) return err;

  const knownError = fromBodyParserError(err) ?? fromPrismaError(err);
  if (knownError) return knownError;

  const isClientError = err?.status >= 400 && err?.status < 500;
  if (isClientError) {
    return new HttpError(err.status, "BAD_REQUEST", "La solicitud no es válida");
  }
  return new HttpError(500, "INTERNAL_ERROR", INTERNAL_ERROR_MESSAGE);
};

const buildErrorBody = (httpError) => ({
  error: httpError.message,
  code: httpError.code,
  ...(httpError.details.length > 0 && { details: httpError.details }),
  timestamp: new Date().toISOString(),
});

/**
 * Manejador global de errores: única fuente del formato de error de la API.
 *
 * Respuesta: `{ error, code, details?, timestamp }`. Los errores 5xx se
 * registran en el log del servidor con el error original.
 */
export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  const httpError = toHttpError(err);
  if (httpError.status >= 500) {
    console.error(`[${req.method} ${req.originalUrl}]`, err);
  }

  res.status(httpError.status).json(buildErrorBody(httpError));
};

/** Responde 404 en JSON para rutas que no existen. */
export const routeNotFoundHandler = (req, res, next) => {
  next(new HttpError(404, "ROUTE_NOT_FOUND", "La ruta solicitada no existe"));
};
