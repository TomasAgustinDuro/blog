import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Images = sequelize.define("images", {
  image_url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  timestamps: true,
  createdAt: "created_at", // Personaliza el nombre del campo de fecha de creación
  updatedAt: "updated_at", // Personaliza el nombre del campo de fecha de actualización
});



export default Images;
