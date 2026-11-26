import * as imageService from "../services/imageService.js";

// Los datos de req.validated ya pasaron por los schemas de Zod de cada ruta
export class ImageControllers {
  static async insertImage(req, res, next) {
    try {
      const result = await imageService.insertImage(req.validated.body.image_url);
      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async updateImage(req, res, next) {
    try {
      const result = await imageService.updateImage(
        req.validated.params.id,
        req.validated.body.image_url
      );
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async deleteImage(req, res, next) {
    try {
      await imageService.deleteImage(req.validated.params.id);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
