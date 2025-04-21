import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Tags from "./Tags.js";
import PostTags from "./PostTags.js";
import Images from "./Image.js";
import Comments from "./Comments.js";

const Post = sequelize.define(
  "post",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT("long"), // Usar TEXT('long') para contenido HTML largo
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

// Métodos Get
Post.getAllPost = async function () {
  const posts = await Post.findAll();
  return posts;
};

Post.getSpecificPost = async function (id) {
  const post = await Post.findByPk(id, {
    include: [
      {
        model: Tags,
        as: "postTags",
        through: { attributes: [] },
      },
      {
        model: Comments,
      },
    ],
  });

  if (!post) {
    throw new Error("El post no existe");
  }

  return post;
};

Post.countAllPost = async function () {
  const result = await Post.count();
  return result;
};

Post.getPaginatedPost = async function (limit, offset) {
  try {
    const posts = await Post.findAll({
      limit: limit,
      offset: offset,
      include: [
        {
          model: Tags,
          as: "postTags",
          through: { attributes: [] },
        },
        {
          model: Comments,
        },
      ],
    });
    console.log("posteos backend", posts);
    return posts;
  } catch (error) {
    throw new Error(error.message);
  }
};

Post.getByTag = async function (tag) {
  const post = await Post.findAll({
    include: [
      {
        model: PostTags,
        where: { tag_id: tag },
      },
    ],
  });
  return post;
};

// Métodos Post
Post.createPost = async (content) => {
  const transaction = await sequelize.transaction();

  try {
    const post = await Post.create(
      {
        title: content.title,
        content: content.content,
        image_id: content.image_id || null,
        date: new Date(),
      },
      { transaction }
    );

    if (content.tags && content.tags.length > 0) {
      // Encontrar o crear tags
      const tags = await Promise.all(
        content.tags.map(async (tagName) => {
          const [tag] = await Tags.findOrCreate({
            where: { name: tagName },
            transaction,
          });
          return tag;
        })
      );

      // Crear asociaciones manualmente
      await Promise.all(
        tags.map((tag) =>
          PostTags.create(
            {
              post_id: post.id,
              tag_id: tag.id,
            },
            { transaction }
          )
        )
      );
    }

    // Recuperar post con tags
    const postWithTags = await Post.findByPk(post.id, {
      include: [
        {
          model: Tags,
          as: "postTags",
          through: { attributes: [] },
        },
      ],
    });

    await transaction.commit();

    return postWithTags;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

Post.editPost = async (id, content) => {
  const editTransaction = await sequelize.transaction();

  try {
    // Actualizar el post
    const [updatedPost] = await Post.update(
      {
        title: content.title,
        content: content.content,
        image_id: content.image_id || null,
        date: new Date(),
      },
      {
        where: { id },
        transaction: editTransaction,
      }
    );

    // Verificar si se ha actualizado el post
    if (updatedPost === 0) {
      throw new Error("Post not found");
    }

    const post = await Post.findByPk(id, { transaction: editTransaction });

    // Eliminar todas las asociaciones previas de tags, aunque no vengan nuevos
    await post.setPostTags([], { transaction: editTransaction });

    if (content.tags && content.tags.length > 0) {
      // Encontrar o crear los nuevos tags
      const tags = await Promise.all(
        content.tags.map(async (tagName) => {
          const [tag] = await Tags.findOrCreate({
            where: { name: tagName },
            transaction: editTransaction,
          });
          return tag;
        })
      );

      // Asociar los nuevos tags
      await post.setPostTags(tags, { transaction: editTransaction });
    }

    // Confirmar la transacción
    await editTransaction.commit();

    // Devolver el post actualizado con sus tags
    // Por esto:
    return await Post.findByPk(id, {
      include: [
        {
          model: Tags,
          as: "postTags",
        },
      ],
    });
  } catch (error) {
    // Revertir cambios en caso de error
    await editTransaction.rollback();
    throw new Error("Error al editar el post: " + error.message);
  }
};

Post.deletePost = async (id) => {
  const post = await Post.findByPk(id);
  console.log(post);

  if (!post) {
    throw new Error("Post no encontrado");
  }

  // Si existe una imagen asociada, eliminarla
  if (post.image_id) {
    await Images.destroy({
      where: { id: post.image_id },
    });
  }

  await Post.destroy({
    where: {
      id: id,
    },
  });
};
export default Post;
