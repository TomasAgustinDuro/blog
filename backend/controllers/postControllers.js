import Post from "../models/Post.js";
import { body, validationResult } from "express-validator";

export class PostControllers {
  static async getAllPost(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const offset = (page - 1) * limit;

      const [totalPosts, posts] = await Promise.all([
        Post.countAllPost({ transaction }),
        Post.getPaginatedPost(limit, offset, { transaction }),
      ]);

      await transaction.commit();

      res.status(200).json({
        posts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalPosts / limit),
          totalPosts,
          perPage: limit,
        },
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Error en /post:", error);
      res.status(500).json({ error: "Error al obtener posts" });
    }
  }

  static async getSpecificPost(req, res) {
    const { id } = req.params;

    try {
      const post = await Post.getSpecificPost(id);
      return res.status(200).json({ post });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getByTag(req, res) {
    const { tag } = req.params;

    try {
      const post = await Post.getByTag(tag);
      return res.status(200).json({ post });
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
      .withMessage("Content must be a string");

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    const content = {
      title: req.body.title,
      content: req.body.content,
      image_id: req.body.image_id || null,
      tags: req.body.tags || [],
    };

    try {
      const post = await Post.createPost(content);
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
      image_id: req.body.image_id || null,
      tags: req.body.tags || [],
    };

    try {
      const post = await Post.editPost(id, content);
      return res.status(201).json({ post });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async deletePost(req, res) {
    const { id } = req.params;
    console.log("id llega al servidor", id);

    const numericId = Number(id);

    // Verificamos que el ID sea válido
    if (isNaN(numericId)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    try {
      await Post.deletePost(id);
      return res.status(201).json({ message: "Borrado satisfactoriamente" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}
