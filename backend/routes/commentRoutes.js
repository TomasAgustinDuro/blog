import { CommentsControllers } from "../controllers/commentsControllers.js";
import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { validateSchema } from "../middleware/validate.js";
import { commentSchema } from "../schemas/commentSchemas.js";

const router = express.Router();

router.get("/", CommentsControllers.getAllComments
);

router.get("/:id",
  CommentsControllers.getSpecificComment
);
router.post("/:postId", validateSchema(commentSchema), CommentsControllers.insertComment);
router.delete("/:id", verifyToken,
  CommentsControllers.deleteComment
);

export default router;
