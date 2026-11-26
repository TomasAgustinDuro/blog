import express from "express";
import { PostControllers } from "../controllers/postControllers.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { validateSchema } from "../middleware/validate.js";
import { postSchema } from "../schemas/postSchemas.js";
import {
  idParamSchema,
  paginationQuerySchema,
  tagParamSchema,
} from "../schemas/requestSchemas.js";

const router = express.Router();

const validatePage = validateSchema(paginationQuerySchema, "query");
const validateId = validateSchema(idParamSchema, "params");

router.get("/", validatePage, PostControllers.getAllPost);
router.get("/:id", validateId, PostControllers.getSpecificPost);
router.get(
  "/tag/:tag",
  validateSchema(tagParamSchema, "params"),
  validatePage,
  PostControllers.getByTag
);

router.post("/", verifyToken, validateSchema(postSchema), PostControllers.createPost);
router.put(
  "/:id",
  verifyToken,
  validateId,
  validateSchema(postSchema),
  PostControllers.editPost
);
router.delete("/:id", verifyToken, validateId, PostControllers.deletePost);

export default router;
