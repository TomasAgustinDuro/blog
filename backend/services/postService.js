import { badRequest, notFound } from "../lib/httpError.js";
import * as postRepository from "../repositories/postRepository.js";

const mapPostToResponse = (post) => ({
    id: post.id,
    title: post.title,
    content: post.content,
    date: post.date,
    postTags: post.post_tags?.map((pt) => ({ id: pt.tags.id, name: pt.tags.name })) || [],
    comments: post.comments || [],
    commentsCount: post.comments?.length ?? 0,
});


export const getAllPost = async (page, limit) => {
    const offset = (page - 1) * limit;

    const [posts, totalPosts] = await Promise.all([
        postRepository.findAllPaginated(offset, limit),
        postRepository.countAll()])

    return {
        posts: posts.map(mapPostToResponse),
        pagination: { currentPage: page, totalPages: Math.ceil(totalPosts / limit), totalPosts, perPage: limit }
    }
}

export const getSpecificPost = async (id) => {
    if (!id) throw badRequest("Falta el id del post");

    const post = await postRepository.findByPk(id)
    if (!post) throw notFound("El post no existe");

    return { post: mapPostToResponse(post) };
}

export const getByTag = async (tag, page = 1, limit = 10) => {
    if (!tag) throw badRequest("Falta el nombre del tag");

    const offset = (page - 1) * limit;
    const posts = await postRepository.findByTag(tag, offset, limit)

    return { posts: posts.map(mapPostToResponse) };
}

// En update y delete, si el post no existe Prisma lanza P2025 (404 en errorHandler)
export const createPost = async (data) => {
    if (!data) throw badRequest("Faltan los datos del post");

    const post = await postRepository.createPost(data)
    return { post: mapPostToResponse(post) };
}

export const updatePost = async (id, data) => {
    if (!id) throw badRequest("Falta el id del post");
    if (!data) throw badRequest("Faltan los datos del post");

    const post = await postRepository.updatedPost(id, data)
    return { post: mapPostToResponse(post) };
}

export const deletePost = async (id) => {
    if (!id) throw badRequest("Falta el id del post");

    const post = await postRepository.deletePost(id)
    return { post: mapPostToResponse(post) };
}
