import express from "express";
import { PostTagsControllers } from "../controllers/postTagsControllers.js";
import {verifyToken} from '../middleware/verifyToken.js'

const router = express.Router();

router.get("/:post_id", verifyToken, (req, res) => {
  PostTagsControllers.getPostTags(req, res);
});

router.post("/:post_id/tags", verifyToken, (req, res) => {
  PostTagsControllers.addTagsToPost(req, res);
});

export default router;
