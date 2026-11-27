import express from "express";
import { ImageControllers } from "../controllers/imageControllers.js";
import { validateSchema } from "../middleware/validate.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { imageSchema } from "../schemas/imageSchemas.js";
import { idParamSchema } from "../schemas/requestSchemas.js";

const router = express.Router();

const validateId = validateSchema(idParamSchema, "params");

router.post("/", verifyToken, validateSchema(imageSchema), ImageControllers.insertImage);
router.put(
  "/:id",
  verifyToken,
  validateId,
  validateSchema(imageSchema),
  ImageControllers.updateImage
);
router.delete("/:id", verifyToken, validateId, ImageControllers.deleteImage);

export default router;
