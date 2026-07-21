import { PrismaClient } from "../generated/prisma"

const prisma = new PrismaClient()

export const findAllPaginated = async (offset, limit) => {
    const posts = await prisma.posts.findMany({
        skip: offset,
        take: limit,
        orderBy: { date: "desc" },
        include: {
            comments: true,
            post_tags: {
                include: { tags: true }
            }
        }
    })

    return posts
}

export const findByPk = async (id) => {
    const post = await prisma.posts.findUnique({
        where: { id },
        include: {
            comments: true,
            post_tags: {
                include: { tags: true }
            }
        }
    })

    return post
}

export const findByTag = async (tag, offset, limit) => {
   const posts = await prisma.posts.findMany({
        skip: offset,
        take: limit,
       where: {
            post_tags: {
                some: { tags: { name: tag } }
            }
        },
        orderBy: { date: "desc" },
        include: {
            comments: true,
            post_tags: {
                include: { tags: true }
            }
        }
    })

    return posts
}

export const createPost = async (data) => {
    return prisma.$transaction(async (tx) => {
        const post = await tx.posts.create({
            data: {
                title: data.title,
                content: data.content,
                date: new Date()
            }
        })

        if (data.tags?.length > 0) {
            for (const tagName of data.tags) {
                const tag = await tx.tags.upsert({
                    where: { name: tagName },
                    create: { name: tagName },
                    update: {}
                })

                await tx.post_tags.create({
                    data: { post_id: post.id, tag_id: tag.id }
                })
            }
        }

        if (data.images?.length > 0) {
            for (const [index, image] of data.images.entries()) {

                await tx.post_images.create({
                    data: { post_id: post.id, image_id: image.id, is_featured: index === 0, order: index }
                })

            }
        }

        return await tx.posts.findUnique({
            where: { id: post.id },
            include: {
                post_tags: {
                    include: {
                        tags: true
                    }
                }
            }
        })

    })


}

export const updatedPost = async (id, data) => {
    return prisma.$transaction(async (tx) => {
        const post = await tx.posts.update({
            where: { id: id },
            data: {
                title: data?.title,
                content: data?.content,
            }
        })

        await tx.post_tags.deleteMany({ where: { post_id: id } })

        if (data.tags?.length > 0) {
            for (const tagName of data.tags) {
                const tag = await tx.tags.upsert({
                    where: { name: tagName },
                    create: { name: tagName },
                    update: {}
                })

                await tx.post_tags.create({
                    data: { post_id: post.id, tag_id: tag.id }
                })
            }

        }

        await tx.post_images.deleteMany({ where: { post_id: id } })

        if (data.images?.length > 0) {
            for (const [index, image] of data.images.entries()) {

                await tx.post_images.create({
                    data: { post_id: post.id, image_id: image.id, is_featured: index === 0, order: index }
                })

            }

        }

        return await tx.posts.findUnique({
            where: { id: post.id },
            include: {
                post_tags: {
                    include: {
                        tags: true
                    }
                }
            }
        })
    })
}

export const countAll = async () => {
    return await prisma.posts.count()

}

export const deletePost = async (id) => {
    return await prisma.posts.delete({ where: { id: id } })
}