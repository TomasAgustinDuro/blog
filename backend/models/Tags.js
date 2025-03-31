import { DataTypes, where } from "sequelize";
import sequelize from "../config/database.js";

const Tags = sequelize.define("tags", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: false
});

Tags.getAllTags = async () => {
  const tags = await Tags.findAll();
  return tags;
};

Tags.insertTag = async (content) => {
  const tag = await Tags.create({
    name: content.name,
  });
  return tag;
};

Tags.editTag = async (id, content) => {
  const tag = await Tags.update(
    {
      name: content.name,
    },
    {
      where: {
        id: id,
      },
    }
  );
  return tag;
};

Tags.deleteTag = async (id) => {
  await Tags.destroy(
    {where : {
      id: id,
    }}
  );
};

export default Tags;
