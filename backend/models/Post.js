import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Tags from "./Tags.js";
import PostTags from "./PostTags.js";
import Images from "./Image.js";
import Comments from "./Comments.js";
import PostImages from "./PostImages.js";

const Post = sequelize.define(
  "post",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT("long"),
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
      {
        model: Images,
        as: "gallery",
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
        date: new Date(),
      },
      { transaction }
    );

    if (content.tags?.length > 0) {
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

    if (content.images?.length > 0) {
      await Promise.all(
        content.images.map((img, index) =>
          PostImages.create(
            {
              post_id: post.id,
              image_id: img.id,
              is_featured: index === 0,
              order: index,
            },
            { transaction }
          )
        )
      );
    }

    // Recuperar post con tags
    const postComplete = await Post.findByPk(post.id, {
      include: [
        {
          model: Tags,
          as: "postTags",
          through: { attributes: [] },
        },
        {
          model: Images,
          as: "gallery", // 👈 Debe coincidir con tu asociación
          through: { attributes: ["is_featured", "order"] }, // 👈 Campos puente
        },
      ],
    });

    await transaction.commit();

    return postComplete;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

Post.editPost = async (id, content) => {
  const editTransaction = await sequelize.transaction();

  try {
    const [updatedPost] = await Post.update(
      {
        title: content.title,
        content: content.content,
        date: new Date(),
      },
      {
        where: { id },
        transaction: editTransaction,
      }
    );

    if (updatedPost === 0) {
      throw new Error("Post not found");
    }

    const post = await Post.findByPk(id, { transaction: editTransaction });

    // 2. Actualizá Tags
    await post.setPostTags([], { transaction: editTransaction });

    if (content.tags?.length > 0) {
      const tags = await Promise.all(
        content.tags.map(async (tagName) => {
          const [tag] = await Tags.findOrCreate({
            where: { name: tagName },
            transaction: editTransaction,
          });
          return tag;
        })
      );

      await post.setPostTags(tags, { transaction: editTransaction });
    }

    // 3. Actualizá Imágenes
    const oldImages = await post.getGallery({ transaction: editTransaction });

    // Borramos todas las relaciones actuales
    await post.setGallery([], { transaction: editTransaction });

    // Creamos nuevas relaciones si hay imágenes
    if (content.images?.length > 0) {
      const imageInstances = await Images.findAll({
        where: {
          id: content.images.map((img) => img.id),
        },
        transaction: editTransaction,
      });

      await post.setGallery(imageInstances, { transaction: editTransaction });
    }

    // 4. Eliminamos imágenes huérfanas del post
    const newImageIds = content.images?.map((img) => img.id) || [];
    const imagesToRemove = oldImages.filter(
      (oldImg) => !newImageIds.includes(oldImg.id)
    );

    for (const img of imagesToRemove) {
      await Images.destroy({
        where: { id: img.id },
        force: false,
        transaction: editTransaction,
      });

      // Opcional: eliminar de Cloudinary si tenés public_id
      // await cloudinary.uploader.destroy(img.public_id);
    }

    // 5. Confirmamos la transacción
    await editTransaction.commit();

    // 6. Retornamos el post actualizado con tags
    return await Post.findByPk(id, {
      include: [
        {
          model: Tags,
          as: "postTags",
        },
        {
          model: Images,
          as: "gallery",
          through: { attributes: ["is_featured", "order"] },
        },
      ],
    });
  } catch (error) {
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
