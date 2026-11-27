import { z } from "zod";
import { TAG_MAX_LENGTH, positiveDbIntFromText } from "./common.js";

// Tope de página para no generar offsets absurdos
const MAX_PAGE = 100_000;
const PAGE_MESSAGE = `La página debe ser un número entero entre 1 y ${MAX_PAGE}`;

export const idParamSchema = z.object({
  id: positiveDbIntFromText("El id debe ser un número entero positivo"),
});

export const postIdParamSchema = z.object({
  postId: positiveDbIntFromText("El id del post debe ser un número entero positivo"),
});

export const tagParamSchema = z.object({
  tag: z
    .string()
    .trim()
    .min(1, "Falta el nombre del tag")
    .max(TAG_MAX_LENGTH, `El tag no puede superar los ${TAG_MAX_LENGTH} caracteres`),
});

export const paginationQuerySchema = z.object({
  page: z.coerce
    .number({ error: PAGE_MESSAGE })
    .int(PAGE_MESSAGE)
    .positive(PAGE_MESSAGE)
    .max(MAX_PAGE, PAGE_MESSAGE)
    .default(1),
});
