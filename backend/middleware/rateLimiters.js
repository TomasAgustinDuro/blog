import rateLimit from "express-rate-limit";
import { HttpError } from "../lib/httpError.js";

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

/**
 * Crea un limitador por IP que responde con el formato de error estándar.
 *
 * @param {number} limit - Requests permitidas por IP cada 15 minutos.
 * @param {string} message - Mensaje para el usuario al superar el límite.
 * @returns {import("express").RequestHandler} Middleware de Express.
 */
const createRateLimiter = (limit, message) =>
  rateLimit({
    windowMs: FIFTEEN_MINUTES_MS,
    limit,
    handler: (req, res, next) => next(new HttpError(429, "TOO_MANY_REQUESTS", message)),
  });

export const loginRateLimiter = createRateLimiter(
  5,
  "Demasiados intentos de inicio de sesión. Esperá 15 minutos e intentá de nuevo."
);

// Frena el spam en el endpoint público de comentarios
export const commentRateLimiter = createRateLimiter(
  10,
  "Enviaste demasiados comentarios seguidos. Esperá unos minutos e intentá de nuevo."
);
