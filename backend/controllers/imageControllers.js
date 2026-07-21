import * as imageRepository from "../repositories/imageRepository.js";

export class ImageControllers {
  static async insertImage(req, res) {
    try {
      const { image_url } = req.body;

      if (!image_url) {
        return res.status(400).json({ error: "image_url is required" });
      }

      const image = await imageRepository.insertImage(image_url);
      return res.status(201).json(image);
    } catch (error) {
      return res.status(500).json({
        error: "Error al guardar imagen",
      });
    }
  }
}
