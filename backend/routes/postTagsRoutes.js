import express from "express";
import { PostTagsControllers } from "../controllers/postTagsControllers.js";
import { requireLogin } from "../middleware/requireLogin.js";

const router = express.Router();

router.get("/:post_id", requireLogin, (req, res) => {
  PostTagsControllers.getPostTags(req, res);
});

router.post("/:post_id/tags", requireLogin, (req, res) => {
  PostTagsControllers.addTagsToPost(req, res);
});

export default router;
