import { badRequest } from "../lib/httpError.js";
import * as imageRepository from "../repositories/imageRepository.js";

const mapImageToResponse = (image) => ({
    id: image.id,
    url: image.image_url,
    created_at: image.created_at,
    updated_at: image.updated_at
})

// Si la imagen no existe, Prisma lanza P2025 y errorHandler responde 404
export const insertImage = async (url) => {
    if (!url) throw badRequest("Falta la URL de la imagen");

    const image = await imageRepository.insertImage(url)
    return { image: mapImageToResponse(image) };
}

export const updateImage = async (id, url) => {
    if (!id) throw badRequest("Falta el id de la imagen");
    if (!url) throw badRequest("Falta la URL de la imagen");

    const image = await imageRepository.updateImage(id, url)
    return { image: mapImageToResponse(image) };
}

export const deleteImage = async (id) => {
    if (!id) throw badRequest("Falta el id de la imagen");

    const image = await imageRepository.deleteImage(id)
    return { image: mapImageToResponse(image) };
}
