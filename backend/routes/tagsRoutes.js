import express from "express";
import { TagsControllers } from "../controllers/tagControllers.js";

const router = express.Router();

router.get("/", (req, res) => {
  TagsControllers.getAllTags(req, res);
});
router.post("/create", (req, res) => {
  TagsControllers.createTag(req, res);
});
router.put("/update/:id", (req, res) => {
  TagsControllers.editTag(req, res);
});
router.delete("/delete/:id", (req, res) => {
  TagsControllers.deleteTag(req, res);
});

export default router;
