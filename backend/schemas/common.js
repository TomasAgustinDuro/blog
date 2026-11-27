import { z } from "zod";

// Mensajes por defecto de Zod en español para los casos sin mensaje propio
z.config(z.locales.es());

// Máximo de una columna Int de PostgreSQL: evita errores de desborde en Prisma
export const MAX_DB_INT = 2_147_483_647;

// Coincide con la columna tags.name (VarChar(255))
export const TAG_MAX_LENGTH = 255;

export const INVALID_BODY_MESSAGE =
  "Los datos enviados no tienen el formato esperado (se espera un objeto JSON)";

/**
 * Mensaje de tipo que distingue un campo faltante de uno con tipo incorrecto.
 *
 * @param {string} requiredMessage - Mensaje cuando el campo no se envió.
 * @param {string} wrongTypeMessage - Mensaje cuando el tipo no es el esperado.
 * @returns {(issue: { input: unknown }) => string} Función de error para Zod.
 */
export const typeError = (requiredMessage, wrongTypeMessage) => (issue) =>
  issue.input === undefined || issue.input === null ? requiredMessage : wrongTypeMessage;

/**
 * Número entero positivo que entra en una columna Int, con un único mensaje.
 *
 * @param {string} message - Mensaje para cualquier valor inválido.
 * @returns {z.ZodNumber} Schema numérico.
 */
export const positiveDbInt = (message) =>
  z.number({ error: message }).int(message).positive(message).max(MAX_DB_INT, message);

/**
 * Igual que positiveDbInt pero convierte el texto de la URL a número.
 *
 * @param {string} message - Mensaje para cualquier valor inválido.
 * @returns {z.ZodCoercedNumber} Schema numérico con coerción.
 */
export const positiveDbIntFromText = (message) =>
  z.coerce.number({ error: message }).int(message).positive(message).max(MAX_DB_INT, message);
