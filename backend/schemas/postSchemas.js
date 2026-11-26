import { z } from "zod";
import {
  INVALID_BODY_MESSAGE,
  TAG_MAX_LENGTH,
  positiveDbInt,
  typeError,
} from "./common.js";

export const POST_TITLE_MAX_LENGTH = 100;

// Repetidos violarían la clave compuesta de post_tags (post_id, tag_id)
const removeDuplicateTags = (tags) => [...new Set(tags)];

// Repetidas violarían el índice único de post_images; se conserva el orden
const removeDuplicateImages = (images) =>
  images.filter(
    (image, index) => images.findIndex((other) => other.id === image.id) === index
  );

const titleSchema = z
  .string({ error: typeError("El título es obligatorio", "El título debe ser un texto") })
  .trim()
  .min(1, "El título es obligatorio")
  .max(
    POST_TITLE_MAX_LENGTH,
    `El título no puede superar los ${POST_TITLE_MAX_LENGTH} caracteres`
  );

const contentSchema = z
  .string({
    error: typeError("El contenido es obligatorio", "El contenido debe ser un texto"),
  })
  .trim()
  .min(1, "El contenido es obligatorio");

const tagSchema = z
  .string({ error: "Cada tag debe ser un texto" })
  .trim()
  .min(1, "Los tags no pueden estar vacíos")
  .max(TAG_MAX_LENGTH, `Cada tag puede tener hasta ${TAG_MAX_LENGTH} caracteres`);

const imageReferenceSchema = z.object(
  { id: positiveDbInt("El id de cada imagen debe ser un número entero positivo") },
  { error: "Cada imagen debe enviarse como un objeto con su id" }
);

export const postSchema = z.object(
  {
    title: titleSchema,
    content: contentSchema,
    tags: z
      .array(tagSchema, { error: "Los tags deben enviarse como una lista" })
      .transform(removeDuplicateTags)
      .optional(),
    images: z
      .array(imageReferenceSchema, { error: "Las imágenes deben enviarse como una lista" })
      .transform(removeDuplicateImages)
      .optional(),
  },
  { error: INVALID_BODY_MESSAGE }
);
