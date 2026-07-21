import express from "express";
import { PostControllers } from "../controllers/postControllers.js";
import { verifyToken } from "../middleware/verifyToken.js";
import {validateSchema} from "../middleware/validate.js"
import {postSchema} from "../schemas/postSchemas.js"

const router = express.Router();

router.get("/", PostControllers.getAllPost);
router.get("/:id", PostControllers.getSpecificPost);
router.get("/tag/:tag", PostControllers.getByTag);

router.post(
  "/",
  verifyToken,
  validateSchema(postSchema),
  PostControllers.createPost
);

router.put("/:id", verifyToken, validateSchema(postSchema),PostControllers.editPost);

router.delete("/:id", verifyToken,
  PostControllers.deletePost);

export default router;
