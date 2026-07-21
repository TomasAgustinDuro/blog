import * as commentService from "../services/commentService.js";

export class CommentsControllers {
  static async getAllComments(req, res, next) {
    const page = parseInt(req.query.page) || 1;

    try {
      const result = await commentService.getAllComments(page, 100);
      return res.status(200).json(result);
    } catch (error) {
      next(error)
    }
  }

  static async getSpecificComment(req, res, next) {
    const { id } = req.params;

    try {
      const comment = await commentService.getSpecificComment(Number(id));
      return res.status(200).json({ comment });
    } catch (error) {
      next(error)
    }
  }

  static async insertComment(req, res, next) {
    const newComment = {
      name: req.body.name,
      content: req.body.content,
      postId: Number(req.params.postId),
    };

    try {
      const comment = await commentService.insertComment(newComment);
      return res.status(201).json({ comment });
    } catch (error) {
      next(error)
    }
  }

  static async deleteComment(req, res, next) {
    const { id } = req.params;

    try {
      await commentService.deleteComment(Number(id));
      return res.status(204).send();
    } catch (error) {
      next(error)
    }
  }
}
