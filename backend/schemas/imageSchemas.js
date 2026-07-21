import { z } from "zod"

export const imageSchema = z.object({
    image_url: z.url("Must be a valid URL"),
})
