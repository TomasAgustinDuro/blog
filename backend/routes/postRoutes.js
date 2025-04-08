import express from "express";
import { PostControllers } from "../controllers/postControllers.js";
import { requireLogin } from "../middleware/requireLogin.js";

const router = express.Router();

router.get("/", (req, res) => {
  PostControllers.getAllPost(req, res);
});

router.get("/:id", (req, res) => {
  PostControllers.getSpecificPost(req, res);
});

router.get("/:tag", (req, res) => {
  PostControllers.getByTag(req, res);
});

router.post("/create", requireLogin, (req, res) => {
  PostControllers.createPost(req, res);
});

router.put("/edit/:id", requireLogin, (req, res) => {
  PostControllers.editPost(req, res);
});

router.delete("/delete/:id", requireLogin, (req, res) => {
  PostControllers.deletePost(req, res);
});

export default router;
