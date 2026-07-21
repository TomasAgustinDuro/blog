import express from "express";
import { ImageControllers } from "../controllers/imageControllers.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/insert", verifyToken, ImageControllers.insertImage);
export default router;
