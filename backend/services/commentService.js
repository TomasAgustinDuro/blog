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
    if (!id) {
        const error = new Error("ID not found");
        error.status = 404;
        throw error;
    }

    const comment = await commentRepository.getSpecificComment(id)

    if (!comment) {
        const error = new Error("comment not found");
        error.status = 404;
        throw error;
    }
    return { comment: mapCommentToResponse(comment) };
}

export const insertComment = async (data) => {
    if (!data) {
        const error = new Error("Data not found");
        error.status = 404;
        throw error;
    }

    const comment = await commentRepository.insertComment(data)

    if (!comment) {
        const error = new Error("Something was wrong");
        error.status = 404;
        throw error;
    }
    return { comment: mapCommentToResponse(comment) };

}

export const deleteComment = async (id) => {
    if (!id) {
        const error = new Error("ID not found");
        error.status = 404;
        throw error;
    }

    const comment = await commentRepository.deleteComment(id)

    if (!comment) {
        const error = new Error("Something was wrong");
        error.status = 404;
        throw error;
    }
    return { comment: mapCommentToResponse(comment) };
}
