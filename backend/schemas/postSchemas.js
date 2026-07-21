import {z} from "zod"

export const postSchema = z.object({
    title: z.string().min(1, "El titulo es obligatorio").max(50, "El titulo no puede tener más de 50 caracteres"),
    content: z.string().min(1, "El contenido es obligatorio"),
    tags: z.array(z.string()).optional(),
    images: z.array(z.object({ id: z.number().int().positive() })).optional(),
})