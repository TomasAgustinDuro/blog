import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const insertImage = async (url) => {
    return await prisma.images.create({
        data: {
            image_url: url,
            created_at: new Date(),
            updated_at: new Date()
        }
    })
}

export const updateImage = async (id, url) => {
    const image = await prisma.images.update({
        where: { id: id },
        data: {
            image_url: url,
            updated_at: new Date()
        }
    })

    return image
}

export const deleteImage = async (id) => {
    return await prisma.images.delete({ where: { id: id } })
}