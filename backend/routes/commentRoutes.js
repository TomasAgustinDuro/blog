import { CommentsControllers } from "../controllers/commentsControllers.js";
import express from "express";
import rateLimit from "express-rate-limit";
import { verifyToken } from "../middleware/verifyToken.js";
import { validateSchema } from "../middleware/validate.js";
import { commentSchema } from "../schemas/commentSchemas.js";

const router = express.Router();

// Limita comentarios públicos por IP para frenar spam
const commentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { error: "Too many comments, try again later" },
});

router.get("/", CommentsControllers.getAllComments
);

router.get("/:id",
  CommentsControllers.getSpecificComment
);
router.post(
  "/:postId",
  commentLimiter,
  validateSchema(commentSchema),
  CommentsControllers.insertComment
);
router.delete("/:id", verifyToken,
  CommentsControllers.deleteComment
);

export default router;
