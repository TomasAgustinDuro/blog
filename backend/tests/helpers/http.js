import { vi } from "vitest";

/**
 * Crea un objeto `res` de Express falso con métodos encadenables.
 *
 * @returns {{ status: import("vitest").Mock, json: import("vitest").Mock,
 *   send: import("vitest").Mock }} Respuesta simulada.
 */
export const createMockResponse = () => {
  const response = {};
  response.status = vi.fn().mockReturnValue(response);
  response.json = vi.fn().mockReturnValue(response);
  response.send = vi.fn().mockReturnValue(response);
  return response;
};

/**
 * Ejecuta un middleware y resuelve cuando llama a `next` o responde.
 *
 * Sirve para middlewares que usan callbacks (por ejemplo jwt.verify).
 *
 * @param {Function} middleware - Middleware de Express a ejecutar.
 * @param {object} request - Request simulado.
 * @returns {Promise<{ response: object, next: import("vitest").Mock }>}
 */
export const runMiddleware = (middleware, request) =>
  new Promise((resolve) => {
    const response = createMockResponse();
    const next = vi.fn(() => resolve({ response, next }));
    const finish = () => resolve({ response, next });

    response.json.mockImplementation(() => {
      finish();
      return response;
    });
    response.send.mockImplementation(() => {
      finish();
      return response;
    });

    middleware(request, response, next);
  });
