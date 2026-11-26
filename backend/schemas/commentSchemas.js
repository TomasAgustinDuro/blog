import { z } from "zod";
import { INVALID_BODY_MESSAGE, typeError } from "./common.js";

const COMMENT_NAME_MAX_LENGTH = 50;
// Coincide con la columna comments.content (VarChar(255))
const COMMENT_CONTENT_MAX_LENGTH = 255;

export const commentSchema = z.object(
  {
    name: z
      .string({ error: typeError("El nombre es obligatorio", "El nombre debe ser un texto") })
      .trim()
      .min(1, "El nombre es obligatorio")
      .max(
        COMMENT_NAME_MAX_LENGTH,
        `El nombre no puede superar los ${COMMENT_NAME_MAX_LENGTH} caracteres`
      ),
    content: z
      .string({
        error: typeError("El comentario no puede estar vacío", "El comentario debe ser un texto"),
      })
      .trim()
      .min(1, "El comentario no puede estar vacío")
      .max(
        COMMENT_CONTENT_MAX_LENGTH,
        `El comentario no puede superar los ${COMMENT_CONTENT_MAX_LENGTH} caracteres`
      ),
  },
  { error: INVALID_BODY_MESSAGE }
);
