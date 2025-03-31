import Tags from "../models/Tags.js";
import { body, validationResult } from "express-validator";

export class TagsControllers {
  static async getAllTags(req, res) {
    try {
      const tags = await Tags.getAllTags();
      res.status(200).json({ tags });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  static async createTag(req, res) {
    await body("name")
      .notEmpty()
      .withMessage("Name is required")
      .isString()
      .withMessage("Name must be a string")
      .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    const content = {
      name: req.body.name,
    };

    try {
      const tag = await Tags.insertTag(content);
      res.status(201).json({ tag });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  static async editTag(req, res) {
    await body("name")
      .notEmpty()
      .withMessage("Name is required")
      .isString()
      .withMessage("Name must be a string")
      .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    const { id } = req.params;

    const content = {
      name: req.body.name,
    };

    try {
      const tag = await Tags.editTag(id, content);
      res.status(201).json({ tag });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  static async deleteTag(req, res) {
    const { id } = req.params;
    try {
      await Tags.deleteTag(id);
      res.status(200).json({ message: "Tag eliminado satisfactoriamente" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
