import express from "express";
import { TagsControllers } from "../controllers/tagControllers.js";
import {verifyToken} from '../middleware/verifyToken.js'

const router = express.Router();

router.get("/", (req, res) => {
  TagsControllers.getAllTags(req, res);
});
router.post("/create", verifyToken, (req, res) => {
  TagsControllers.createTag(req, res);
});
router.put("/update/:id", verifyToken, (req, res) => {
  TagsControllers.editTag(req, res);
});
router.delete("/delete/:id", verifyToken, (req, res) => {
  TagsControllers.deleteTag(req, res);
});

export default router;
