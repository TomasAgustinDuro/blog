import express from "express";
import { PostControllers } from "../controllers/postControllers.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", (req, res) => {
  PostControllers.getAllPost(req, res);
});

router.get("/:id", (req, res) => {
  PostControllers.getSpecificPost(req, res);
});

router.get("/tag/:tag", (req, res) => {
  PostControllers.getByTag(req, res);
});

router.post(
  "/create",
  verifyToken,
  PostControllers.createPost
);

router.put("/edit/:id", verifyToken, (req, res) => {
  PostControllers.editPost(req, res);
});

router.delete("/delete/:id", verifyToken, (req, res) => {
  PostControllers.deletePost(req, res);
});

export default router;
