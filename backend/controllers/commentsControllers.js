import Comments from "../models/Comments.js";
import {body, validationResult} from 'express-validator'

export class CommentsControllers {
  static async getAllComments(req, res) {
    try {
      const comments = await Comments.getAllComments();
      return res.status(200).json({ comments });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getSpecificComment(req, res) {
    const { id } = req.params;

    try {
      const comment = await Comments.getSpecificComment(id);
      return res.status(200).json({ comment });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async insertComment(req, res) {
    await body('name').notEmpty().withMessage('Name is required').isString().withMessage('Name must be a string').run(req)
    await body('content').notEmpty().withMessage('Content is required').isString().withMessage('Content must be a string')

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({error: errors.array()})
    }

    const newComment = {
      name: req.body.name,
      content: req.body.content,
    };

    try {
      const comment = await Comments.insertComment(newComment);
      return res.status(201).json({ comment });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async deleteComment(req, res) {
    const {id} = req.params;

    try {
      await Comments.deleteComments(id);
      return res.status(204).send()
    } catch(error) {
      return res.status(500).json({error: error.message})
    }
  }
}
