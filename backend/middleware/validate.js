import { validationError } from "../lib/httpError.js";

/**
 * Valida una parte de la request con un schema de Zod.
 *
 * Los datos validados quedan en `req.validated[source]` (body, params o
 * query), así una ruta puede validar varias partes sin pisarse.
 *
 * @param {import("zod").ZodType} schema - Schema a aplicar.
 * @param {"body" | "params" | "query"} [source="body"] - Parte a validar.
 * @returns {import("express").RequestHandler} Middleware de Express.
 */
export const validateSchema = (schema, source = "body") => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return next(validationError(details));
    }

    req.validated = { ...req.validated, [source]: result.data };
    next();
  };
};
