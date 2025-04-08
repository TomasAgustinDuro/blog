import express from "express";
import { TagsControllers } from "../controllers/tagControllers.js";
import { requireLogin } from "../middleware/requireLogin.js";

const router = express.Router();

router.get("/", (req, res) => {
  TagsControllers.getAllTags(req, res);
});
router.post("/create", requireLogin, (req, res) => {
  TagsControllers.createTag(req, res);
});
router.put("/update/:id", requireLogin, (req, res) => {
  TagsControllers.editTag(req, res);
});
router.delete("/delete/:id", requireLogin, (req, res) => {
  TagsControllers.deleteTag(req, res);
});

export default router;
