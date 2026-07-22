import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const findAllPaginated = async (offset, limit) => {
    const comments = await prisma.comments.findMany({
        skip: offset,
        take: limit,
        orderBy: { date: "desc" },
    })

    return comments
}

export const getSpecificComment = async (id) => {
    return await prisma.comments.findUnique({ where: { id } })
}

export const insertComment = async (data) => {
    const comment = await prisma.comments.create({
        data: {
            name: data.name,
            content: data.content,
            date: new Date(),
            post_id: data.postId
        }
    })

    return comment
}

export const deleteComment = async (id) => {
    return await prisma.comments.delete({where: {id: id}})
}