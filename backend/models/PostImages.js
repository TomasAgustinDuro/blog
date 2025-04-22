import sequelize from "../config/database.js";
import { DataTypes } from "sequelize";

const PostImages = sequelize.define(
  "post_images",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "posts", key: "id" }, // Relación explícita
    },
    image_id: {
      // 👈 Nombre en singular
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "images", key: "id" },
    },
    is_featured: {
      // 👈 Campo adicional útil
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["post_id", "image_id"], // Evita duplicados
      },
    ],
  }
);
export default PostImages