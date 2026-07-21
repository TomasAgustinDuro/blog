import Image from "../models/Image.js";

export class ImageControllers {
  static async insertImage(req, res) {
    try {
      const { image_url } = req.body;

      const image = await Image.create({ image_url }); // o tu método custom

      res.status(201).json(image);
    } catch (error) {
      res.status(500).json({
        error: "Error al guardar imagen",
        details: process.env.NODE_ENV === "development" ? error.message : null,
      });
    }
  }


}


