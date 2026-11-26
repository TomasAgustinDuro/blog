import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { unauthorized } from "../lib/httpError.js";

/**
 * Exige un JWT válido en el header `Authorization: Bearer <token>`.
 *
 * Deja el payload decodificado en `req.user`. Cada caso de rechazo tiene su
 * propio código para que el frontend sepa si debe pedir un nuevo login.
 */
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(
      unauthorized("AUTH_REQUIRED", "Necesitás iniciar sesión para realizar esta acción")
    );
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return next(unauthorized("INVALID_TOKEN", "El token de sesión no tiene un formato válido"));
  }

  jwt.verify(token, env.JWT_SECRET, (err, decoded) => {
    if (err?.name === "TokenExpiredError") {
      return next(unauthorized("TOKEN_EXPIRED", "Tu sesión expiró. Iniciá sesión nuevamente"));
    }
    if (err) {
      return next(unauthorized("INVALID_TOKEN", "La sesión no es válida. Iniciá sesión nuevamente"));
    }

    req.user = decoded;
    next();
  });
};
