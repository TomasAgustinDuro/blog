import express from "express";
import { CommentsControllers } from "../controllers/commentsControllers.js";
import { commentRateLimiter } from "../middleware/rateLimiters.js";
import { validateSchema } from "../middleware/validate.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { commentSchema } from "../schemas/commentSchemas.js";
import {
  idParamSchema,
  paginationQuerySchema,
  postIdParamSchema,
} from "../schemas/requestSchemas.js";

const router = express.Router();

const validateId = validateSchema(idParamSchema, "params");

router.get(
  "/",
  validateSchema(paginationQuerySchema, "query"),
  CommentsControllers.getAllComments
);
router.get("/:id", validateId, CommentsControllers.getSpecificComment);
router.post(
  "/:postId",
  commentRateLimiter,
  validateSchema(postIdParamSchema, "params"),
  validateSchema(commentSchema),
  CommentsControllers.insertComment
);
router.delete("/:id", verifyToken, validateId, CommentsControllers.deleteComment);

export default router;
