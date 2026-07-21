import * as imageRepository from "../repositories/imageRepository.js";

const mapImageToResponse = (image) => ({
    id: image.id,
    url: image.image_url,
    created_at: image.created_at,
    updated_at: image.updated_at
})

export const insertImage = async (url) => {
    if (!url) {
        const error = new Error("Data not found");
        error.status = 404;
        throw error;
    }

    const image = await imageRepository.insertImage(url)

    if (!image) {
        const error = new Error("Something was wrong");
        error.status = 404;
        throw error;
    }
    return { image: mapImageToResponse(image) };
}

export const updateImage = async (id, url) => {
    if (!id) {
        const error = new Error("ID not found");
        error.status = 404;
        throw error;
    }


    if (!url) {
        const error = new Error("Data not found");
        error.status = 404;
        throw error;
    }

    const image = await imageRepository.updateImage(id, url)

    if (!image) {
        const error = new Error("Something was wrong");
        error.status = 404;
        throw error;
    }
    return { image: mapImageToResponse(image) };

}

export const deleteImage = async (id) => {
    if (!id) {
        const error = new Error("ID not found");
        error.status = 404;
        throw error;
    }

    const image = await imageRepository.deleteImage(id)

    if (!image) {
        const error = new Error("Something was wrong");
        error.status = 404;
        throw error;
    }
    return { image: mapImageToResponse(image) };
}