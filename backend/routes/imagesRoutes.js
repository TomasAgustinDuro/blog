import express from "express";
import { ImageControllers } from "../controllers/imageControllers.js";

const router = express.Router();

router.post("/insert", ImageControllers.insertImage);
export default router;
