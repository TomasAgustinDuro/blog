import * as postService from "../services/postService.js";

const POSTS_PER_PAGE = 10;

// Los datos de req.validated ya pasaron por los schemas de Zod de cada ruta
export class PostControllers {
  static async getAllPost(req, res, next) {
    try {
      const result = await postService.getAllPost(req.validated.query.page, POSTS_PER_PAGE);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getSpecificPost(req, res, next) {
    try {
      const result = await postService.getSpecificPost(req.validated.params.id);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getByTag(req, res, next) {
    const { tag } = req.validated.params;

    try {
      const result = await postService.getByTag(tag, req.validated.query.page, POSTS_PER_PAGE);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async createPost(req, res, next) {
    const { title, content, tags = [], images = [] } = req.validated.body;

    try {
      const result = await postService.createPost({ title, content, tags, images });
      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async editPost(req, res, next) {
    // tags/images ausentes significan "no modificar" (el editor no reenvía imágenes)
    const { title, content, tags, images } = req.validated.body;

    try {
      const result = await postService.updatePost(req.validated.params.id, {
        title,
        content,
        tags,
        images,
      });
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async deletePost(req, res, next) {
    try {
      const result = await postService.deletePost(req.validated.params.id);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
