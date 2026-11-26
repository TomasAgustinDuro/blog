import * as postService from "../services/postService.js";

const POSTS_PER_PAGE = 10;

export class PostControllers {
  static async getAllPost(req, res, next) {
    const page = parseInt(req.query.page) || 1;

    try {
      const result = await postService.getAllPost(page, POSTS_PER_PAGE)

      res.status(200).json(result);
    } catch (error) {
      next(error)
    }
  }

  static async getSpecificPost(req, res, next) {
    const { id } = req.params;

    try {
      const result = await postService.getSpecificPost(id)
      return res.status(200).json(result);
    } catch (error) {
      next(error)
    }
  }

  static async getByTag(req, res, next) {
    const { tag } = req.params;
    const page = parseInt(req.query.page) || 1;

    try {
      const result = await postService.getByTag(tag, page, POSTS_PER_PAGE)
      return res.status(200).json(result);
    } catch (error) {
      next(error)
    }
  }

  static async createPost(req, res, next) {
    // Datos ya validados y depurados por el middleware de Zod
    const { title, content, tags = [], images = [] } = req.validated;

    try {
      const result = await postService.createPost({ title, content, tags, images });
      return res.status(201).json(result);
    } catch (error) {
      next(error)
    }
  }

  static async editPost(req, res, next) {
    const { id } = req.params;
    const { title, content, tags = [], images = [] } = req.validated;

    try {
      const result = await postService.updatePost(Number(id), {
        title,
        content,
        tags,
        images,
      });
      return res.status(200).json(result);
    } catch (error) {
      next(error)
    }
  }

  static async deletePost(req, res, next) {
    const { id } = req.params;

    try {
      const result = await postService.deletePost(id);
      return res.status(200).json(result);
    } catch (error) {
      next(error)
    }
  }
}
