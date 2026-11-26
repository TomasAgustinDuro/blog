import { z } from "zod";
import { INVALID_BODY_MESSAGE, typeError } from "./common.js";

export const loginSchema = z.object(
  {
    user: z
      .string({ error: typeError("Ingresá el usuario", "El usuario debe ser un texto") })
      .min(3, "El usuario debe tener al menos 3 caracteres"),
    password: z
      .string({ error: typeError("Ingresá la contraseña", "La contraseña debe ser un texto") })
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
  },
  { error: INVALID_BODY_MESSAGE }
);
