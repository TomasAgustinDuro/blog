// Límites de los formularios. Deben coincidir con los schemas de Zod del backend
// (backend/schemas) para que el usuario no pueda escribir algo que la API rechace.
export const POST_TITLE_MAX_LENGTH = 100;
export const TAG_MAX_LENGTH = 255;
export const COMMENT_NAME_MAX_LENGTH = 50;
export const COMMENT_CONTENT_MAX_LENGTH = 255;
