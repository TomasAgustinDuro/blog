import * as commentService from "../services/commentService.js";

const COMMENTS_PER_PAGE = 100;

// Los datos de req.validated ya pasaron por los schemas de Zod de cada ruta
export class CommentsControllers {
  static async getAllComments(req, res, next) {
    try {
      const result = await commentService.getAllComments(
        req.validated.query.page,
        COMMENTS_PER_PAGE
      );
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getSpecificComment(req, res, next) {
    try {
      const result = await commentService.getSpecificComment(req.validated.params.id);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async insertComment(req, res, next) {
    const newComment = {
      name: req.validated.body.name,
      content: req.validated.body.content,
      postId: req.validated.params.postId,
    };

    try {
      const result = await commentService.insertComment(newComment);
      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async deleteComment(req, res, next) {
    try {
      await commentService.deleteComment(req.validated.params.id);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
