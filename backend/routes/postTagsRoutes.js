import express from 'express'
import {PostTagsControllers} from '../controllers/postTagsControllers.js'

const router = express.Router()

router.get('/:post_id', (req, res) => {
    PostTagsControllers.getPostTags(req, res)
})

router.post('/:post_id/tags', (req, res) => {
    PostTagsControllers.addTagsToPost(req, res);
});

export default router