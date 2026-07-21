import * as postService from "../services/postService.js";


export class PostControllers {
  static async getAllPost(req, res, next) {
    const page = parseInt(req.query.page) || 1;

    try {
      const result = await postService.getAllPost(page, 10)

      res.status(201).json(result);
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

    try {
      const result = await postService.getByTag(tag)
      return res.status(200).json(result);
    } catch (error) {
      next(error)
    }
  }

  static async createPost(req, res, next) {

    const content = {
      title: req.body.title,
      content: req.body.content,
      tags: req.body.tags || [],
      images: req.body.images || [],
    };

    try {
      const result = await postService.createPost(content);
      return res.status(200).json(result);
    } catch (error) {
      next(error)
    }
  }

  static async editPost(req, res, next) {
    const { id } = req.params;

    const content = {
      title: req.body.title,
      content: req.body.content,
      tags: req.body.tags || [],
      images: req.body.images || [],
    };

    try {
      const result = await postService.updatePost(Number(id), content);
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
