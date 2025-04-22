import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Images = sequelize.define(
  "images",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: false,

    },
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    paranoid: false, // 👈 Opcional: borrado lógico
  }
);

Images.insertImage = async () => {
  const img = await Images.create({
    image_url
  });
  return img;
};

Images.updateImage = async (id, newUrl) => {
  const [affectedRows] = await Images.update(
    { image_url: newUrl },
    { where: { id } }
  );
  return affectedRows > 0;
};


export default Images;
