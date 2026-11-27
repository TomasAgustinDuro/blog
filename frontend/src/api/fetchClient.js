const API_URL = import.meta.env.VITE_API_URL;

const NETWORK_ERROR_MESSAGE =
  "No se pudo conectar con el servidor. Revisá tu conexión e intentá de nuevo.";

/**
 * Arma el Error que reciben los componentes a partir de una respuesta fallida.
 *
 * El backend responde `{ error, code, details }`; `error` ya es un mensaje en
 * español pensado para el usuario. Si la respuesta no trae JSON se usa un
 * mensaje genérico con el código HTTP.
 */
const buildRequestError = async (response) => {
  const errorBody = await response.json().catch(() => ({}));
  const requestError = new Error(
    errorBody.error || `No se pudo completar la solicitud (código ${response.status}).`
  );
  requestError.status = response.status;
  requestError.code = errorBody.code;
  requestError.details = errorBody.details ?? [];
  return requestError;
};

export const fetchClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  // headers va al final para que options no pise el Authorization
  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  let response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, config);
  } catch {
    throw new Error(NETWORK_ERROR_MESSAGE);
  }

  if (!response.ok) throw await buildRequestError(response);

  if (response.status === 204) return null;
  return response.json();
};
