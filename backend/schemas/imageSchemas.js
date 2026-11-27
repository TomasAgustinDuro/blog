import { z } from "zod";
import { INVALID_BODY_MESSAGE, typeError } from "./common.js";

// Coincide con la columna images.image_url (VarChar(255))
const IMAGE_URL_MAX_LENGTH = 255;

export const imageSchema = z.object(
  {
    // Solo http/https: evita guardar esquemas como javascript: o data:
    image_url: z
      .url({
        protocol: /^https?$/,
        error: typeError("Falta la URL de la imagen", "La URL de la imagen no es válida"),
      })
      .max(
        IMAGE_URL_MAX_LENGTH,
        `La URL de la imagen no puede superar los ${IMAGE_URL_MAX_LENGTH} caracteres`
      ),
  },
  { error: INVALID_BODY_MESSAGE }
);
