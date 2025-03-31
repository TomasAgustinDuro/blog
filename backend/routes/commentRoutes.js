import { CommentsControllers } from "../controllers/commentsControllers.js";
import express from "express";

const router = express.Router()

router.get("/", (req, res) => {
  CommentsControllers.getAllComments(req, res);
});
router.get("/:id", (req, res) => {
    CommentsControllers.getSpecificComment(req, res);
})
router.post('/create', (req, res) => {
    CommentsControllers.insertComment(req, res);
})
router.delete('/delete/:id', (req, res) => {
  CommentsControllers.deleteComment(req, res)
})

export default router