/**
 * Error HTTP controlado por la aplicación.
 *
 * Su `message` se muestra tal cual al usuario, por eso debe estar en español
 * y no contener datos internos (SQL, nombres de tablas, stack, secretos).
 * `code` es un identificador estable en inglés pensado para el frontend.
 */
export class HttpError extends Error {
  /**
   * @param {number} status - Código HTTP de la respuesta.
   * @param {string} code - Código estable del error (ej. "NOT_FOUND").
   * @param {string} message - Mensaje seguro para mostrar al usuario.
   * @param {{ field: string, message: string }[]} [details] - Errores por campo.
   */
  constructor(status, code, message, details = []) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (message) => new HttpError(400, "BAD_REQUEST", message);

export const notFound = (message) => new HttpError(404, "NOT_FOUND", message);

export const unauthorized = (code, message) => new HttpError(401, code, message);

/**
 * Crea un error de validación cuyo mensaje resume todos los campos inválidos.
 *
 * @param {{ field: string, message: string }[]} details - Errores por campo.
 * @returns {HttpError} Error 400 con código VALIDATION_ERROR.
 */
export const validationError = (details) => {
  const uniqueMessages = [...new Set(details.map((detail) => detail.message))];
  return new HttpError(400, "VALIDATION_ERROR", uniqueMessages.join(". "), details);
};
