import { badRequest, notFound } from "../lib/httpError.js";
import * as commentRepository from "../repositories/commentRepository.js";

const mapCommentToResponse = (comment) => ({
    id: comment.id,
    name: comment.name,
    content: comment.content,
    date: comment.date,
});

export const getAllComments = async (page, limit) => {
    const offset = (page - 1) * limit;
    const comments = await commentRepository.findAllPaginated(offset, limit);

    return {
        comments: comments.map(mapCommentToResponse),
    };
}

export const getSpecificComment = async (id) => {
    if (!id) throw badRequest("Falta el id del comentario");

    const comment = await commentRepository.getSpecificComment(id)
    if (!comment) throw notFound("El comentario no existe");

    return { comment: mapCommentToResponse(comment) };
}

// Post inexistente al comentar: Prisma lanza P2003 y errorHandler responde 404
export const insertComment = async (data) => {
    if (!data) throw badRequest("Faltan los datos del comentario");

    const comment = await commentRepository.insertComment(data)
    return { comment: mapCommentToResponse(comment) };
}

export const deleteComment = async (id) => {
    if (!id) throw badRequest("Falta el id del comentario");

    const comment = await commentRepository.deleteComment(id)
    return { comment: mapCommentToResponse(comment) };
}
