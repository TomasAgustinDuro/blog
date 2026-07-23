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
    if (!id) {
        const error = new Error("ID not found");
        error.status = 404;
        throw error;
    }

    const post = await postRepository.findByPk(Number(id))

    if (!post) {
        const error = new Error("Post not found");
        error.status = 404;
        throw error;
    }
    return { post: mapPostToResponse(post) };
}

export const getByTag = async (tag) => {
    if (!tag) {
        const error = new Error("Tag not found");
        error.status = 404;
        throw error;
    }

    const post = await postRepository.findByTag(tag)

    if (!post) {
        const error = new Error("Post not found");
        error.status = 404;
        throw error;
    }
    return { post: posts.map(mapPostToResponse) };
}

export const createPost = async (data) => {
    if (!data) {
        const error = new Error("Data not found");
        error.status = 404;
        throw error;
    }

    const post = await postRepository.createPost(data)

    if (!post) {
        const error = new Error("Something was wrong");
        error.status = 404;
        throw error;
    }
    return { post: mapPostToResponse(post) };

}

export const updatePost = async (id, data) => {
    if (!id) {
        const error = new Error("ID not found");
        error.status = 404;
        throw error;
    }


    if (!data) {
        const error = new Error("Data not found");
        error.status = 404;
        throw error;
    }

    const post = await postRepository.updatedPost(id, data)

    if (!post) {
        const error = new Error("Something was wrong");
        error.status = 404;
        throw error;
    }
    return { post: mapPostToResponse(post) };

}

export const deletePost = async (id) => {
    if (!id) {
        const error = new Error("ID not found");
        error.status = 404;
        throw error;
    }

    const post = await postRepository.deletePost(id)

    if (!post) {
        const error = new Error("Something was wrong");
        error.status = 404;
        throw error;
    }
    return { post: mapPostToResponse(post) };
}