import { z } from "zod"

export const commentSchema = z.object({
    name: z.string().min(1, "El nombre es obligatorio").max(50, "Máximo 50 caracteres"),
    content: z
        .string()
        .min(1, "El comentario no puede estar vacío")
        // Coincide con la columna comments.content (VarChar(255))
        .max(255, "Máximo 255 caracteres"),
})