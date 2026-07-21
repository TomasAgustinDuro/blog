import * as imageService from "../services/imageService.js";

export class ImageControllers {
  static async insertImage(req, res) {
    try {
      const { image_url } = req.body;

      const image = await imageService.insertImage(image_url);
      return res.status(201).json(image);
    } catch (error) {
      next(error)
    }
  }

  static async updateImage(req, res, next) {
    const { id } = req.params;
    const { image_url } = req.body;

    try {
      const result = await imageService.updateImage(Number(id), image_url);
      return res.status(200).json(result);
    } catch (error) {
      next(error)
    }
  }

  static async deleteImage(req, res, next) {
    const { id } = req.params;

    try {
      const result = await imageService.deleteImage(id);
      return res.status(204).json(result);
    } catch (error) {
      next(error)
    }
  }
}
