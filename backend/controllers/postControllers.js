import * as postRepository from "../repositories/postRepository.js";
import { body, validationResult } from "express-validator";

export class PostControllers {
  static async getAllPost(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    try {
      const totalPosts = await postRepository.countAll();
      const posts = await postRepository.findAllPaginated(offset, limit);
      const totalPages = Math.ceil(totalPosts / limit);

      res.status(200).json({
        posts,
        pagination: {
          currentPage: page,
          totalPages,
          totalPosts,
          perPage: limit,
        },
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getSpecificPost(req, res) {
    const { id } = req.params;

    try {
      const post = await postRepository.findByPk(Number(id));
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      return res.status(200).json({ post });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getByTag(req, res) {
    const { tag } = req.params;

    try {
      const posts = await postRepository.findByTag(tag);
      return res.status(200).json({ posts });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async createPost(req, res) {
    await body("title")
      .notEmpty()
      .withMessage("Title is required")
      .isString()
      .withMessage("Title must be a string")
      .run(req);
    await body("content")
      .notEmpty()
      .withMessage("Content is required")
      .isString()
      .withMessage("Content must be a string")
      .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    const content = {
      title: req.body.title,
      content: req.body.content,
      tags: req.body.tags || [],
      images: req.body.images || [],
    };

    try {
      const post = await postRepository.createPost(content);
      return res.status(201).json({ post });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async editPost(req, res) {
    await body("title")
      .notEmpty()
      .withMessage("Title is required")
      .isString()
      .withMessage("Title must be a string")
      .run(req);
    await body("content")
      .notEmpty()
      .withMessage("Content is required")
      .isString()
      .withMessage("Content must be a string")
      .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    const { id } = req.params;

    const content = {
      title: req.body.title,
      content: req.body.content,
      tags: req.body.tags || [],
      images: req.body.images || [],
    };

    try {
      const post = await postRepository.updatedPost(Number(id), content);
      return res.status(200).json({ post });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async deletePost(req, res) {
    const { id } = req.params;
    const numericId = Number(id);

    if (isNaN(numericId)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    try {
      await postRepository.deletePost(numericId);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}
