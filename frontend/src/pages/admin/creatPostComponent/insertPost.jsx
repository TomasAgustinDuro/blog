import React, { useState, useEffect } from "react";
import { useCreatePosts } from "../../../api/blogApi";
import styles from "./insertPost.module.css";
import { useNavigate } from "react-router";
import { Color } from "@tiptap/extension-color"; // Añadido
import { Image } from "@tiptap/extension-image";
import TextStyle from "@tiptap/extension-text-style";
import { EditorProvider } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { MenuBar } from "./components/MenuBar";
import { useImages } from "../../../context/ImagesContext";

const extensions = [
  Color.configure({ types: [TextStyle.name] }), // Eliminado ListItem.name
  TextStyle,
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false,
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false,
    },
    gapcursor: false, // 👈 Desactiva el Gapcursor integrado
  }),
  Image.configure({
    HTMLAttributes: {
      class: "tiptap-image",
      "data-image-id": "", // Para rastrear imágenes
    },
    inline: true,
    allowBase64: false,
  }),
];

function CreatePostForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("<p>¡Escribe aquí tu contenido!</p>");
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState("");
  const { images, featuredImageId } = useImages();
  const navigate = useNavigate();

  const { mutate, isLoading, isSuccess, isError, error } = useCreatePosts();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Creamos el nuevo post
    const newPost = {
      title,
      content,
      tags,
      images: images.map((img) => ({ id: img.id })),
    };

    // Ejecutamos la mutación con el post
    mutate(newPost);
  };

  useEffect(() => {
    if (isSuccess) {
      const timeout = setTimeout(() => {
        navigate("/admin/post");
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [isSuccess, navigate]);

  const handleAddTag = (e) => {
    e.preventDefault();
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };


  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div>
        <EditorProvider
          extensions={extensions}
          content={content}
          editorProps={{
            attributes: {
              class: `${styles.tiptapEditor}`,
            },
          }}
          slotBefore={<MenuBar />}
          onUpdate={({ editor }) => {
            setContent(editor.getHTML());
          }}
        />
      </div>

      <div className={styles.inputTagContainer}>
        <input
          type="text"
          placeholder="Add a tag"
          value={currentTag}
          onChange={(e) => setCurrentTag(e.target.value)}
        />
        <button onClick={handleAddTag}>Add Tag</button>
      </div>
      <div className={styles.tagsContainer}>
        {tags.map((tag, index) => (
          <span className={styles.tag} key={index}>
            {tag}
          </span>
        ))}
      </div>
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Submitting..." : "Create Post"}
      </button>

      {isSuccess && (
        <div className={styles.success}>{"Post creado exitosamente"}</div>
      )}
      {isError && <div className={styles.error}>Error: {error.message}</div>}
    </form>
  );
}

export default CreatePostForm;
