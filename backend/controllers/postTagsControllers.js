import PostTags from "../models/PostTags.js";

export class PostTagsControllers {
    static async getPostTags(req, res){
        const {post_id} = req.params
        try {
            const postTags = await PostTags.getPostTags(post_id)
            res.status(200).json({postTags})
        }catch(error){
            res.status(500).json({error:error.message})
        }
    }
    static async addTagsToPost(req, res){
        const {post_id, tag_id} = req.body
        try {
            const postTags = await PostTags.addTagsToPost(post_id, tag_id)
            res.status(201).json({postTags})
        }catch(error){
            res.status(500).json({error:error.message})
        }
    }
}
