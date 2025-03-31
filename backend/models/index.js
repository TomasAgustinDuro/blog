// models/index.js
import Post from "./Post.js";
import Comments from "./Comments.js";
import PostTags from "./PostTags.js";
import Images from "./Image.js";
import Tags from "./Tags.js";

// models/index.js
Comments.belongsTo(Post, {
  foreignKey: "post_id",
  onDelete: "CASCADE", // Elimina comentarios cuando se borra un post
});

Post.hasMany(Comments, {
  foreignKey: "post_id",
  onDelete: "CASCADE", // Permite eliminación en cascada
});

Post.hasMany(Images, {
  foreignKey: "post_id",
  onDelete: "CASCADE", // Elimina imágenes relacionadas
});

Images.belongsTo(Post, {
  foreignKey: "post_id",
  onDelete: "CASCADE", // Permite eliminación en cascada
});

PostTags.belongsTo(Post, {
  foreignKey: "post_id",
  onDelete: "CASCADE", // Elimina entradas de post_tags
});

// También puedes agregar en la relación muchos a muchos
Post.belongsToMany(Tags, {
  through: PostTags,
  foreignKey: "post_id",
  otherKey: "tag_id",
  as: "postTags",
  onDelete: "CASCADE", // Opcional, dependiendo de tu lógica de negocio
});

Tags.belongsToMany(Post, {
  through: PostTags,
  foreignKey: "tag_id",
  otherKey: "post_id",
  as: "taggedPosts", // Puedes cambiar este nombre si quieres
  onDelete: "CASCADE",
});

// Exportación de modelos
export { Post, Comments, PostTags, Images, Tags };
