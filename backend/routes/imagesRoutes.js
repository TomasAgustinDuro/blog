import express from "express";
import { ImageControllers } from "../controllers/imageControllers.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { imageSchema } from "../schemas/imageSchemas.js";
import { validateSchema } from "../middleware/validate.js";

const router = express.Router();

router.post("/", verifyToken, validateSchema(imageSchema),ImageControllers.insertImage);
router.put("/:id", verifyToken, validateSchema(imageSchema),ImageControllers.updateImage)
router.delete("/:id", verifyToken,ImageControllers.deleteImage);

export default router;
