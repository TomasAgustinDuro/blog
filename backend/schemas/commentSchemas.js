import { z } from "zod"

export const commentSchema = z.object({
    name: z.string().min(1, "El nombre es obligatorio").max(50, "Máximo 50 caracteres"),
    content: z
        .string()
        .min(1, "El comentario no puede estar vacío")
        .max(500, "Máximo 500 caracteres"),
})