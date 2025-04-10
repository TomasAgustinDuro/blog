import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Images = sequelize.define(
  "images",
  {
    image_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // Si tenés otros campos tipo post_id, los ponés acá
  },
  {
    timestamps: true, // ✅ Esto va en el segundo parámetro
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Images;
