import {z} from "zod"

export const loginSchema = z.object({
    user: z.string().min(3, "El usuario debe tener al menos 3 caracteres"),
    password:z.string().min(6, "La contraseña debe tener al menos 3 caracteres"),
})


