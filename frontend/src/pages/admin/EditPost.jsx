import { useState, useEffect } from "react";
import { usePostById, useEditPost } from "../../api/blogApi";
import { useParams } from "react-router";
import styles from "./editPost.module.css";
import { useNavigate } from "react-router";
import { Color } from "@tiptap/extension-color"; // Añadido
import { Image } from "@tiptap/extension-image";
import TextStyle from "@tiptap/extension-text-style";
import { EditorProvider } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { MenuBar } from "../admin/creatPostComponent/components/MenuBar";
import { useImages } from "../../context/ImagesContext";
import { useRef } from "react";

function EditPost() {
  const { id } = useParams();
  const { data: post } = usePostById(id);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const { images, featuredImageId } = useImages();
  const [currentTag, setCurrentTag] = useState("");
  const { mutate, isLoading, isSuccess, isError, error, data } = useEditPost();

  const editorRef = useRef(null)

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

  // Manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();

    const body = {
      id,
      title,
      content: editorRef.current?.getHTML(), 
      tags,
    };
    mutate(body);
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  useEffect(() => {
    if (isSuccess) {
      const timeout = setTimeout(() => {
        navigate("/admin/post");
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [isSuccess, navigate]);

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setTags(post.postTags.map((tag) => tag.name));
    }
  }, [post]);

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <form onSubmit={handleSubmit} className={styles.editContainer}>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <div>
        <EditorProvider
          extensions={extensions}
          key={post?.id || "default"} // 👈 Fuerza que se reinicialice
          content={post?.content || "<p>Cargando...</p>"}
          editorProps={{
            attributes: {
              class: `${styles.tiptapEditor}`,
            },
          }}
          slotBefore={<MenuBar />}
          onUpdate={({ editor }) => {
            // Solo actualizás al enviar, no hacés setContent en cada keystroke
            editorRef.current = editor;
          }}
        />
      </div>

      <div className={styles.tagList}>
        {tags.map((tag, index) => (
          <div key={index} className={styles.tagItem}>
            <p>{tag}</p>
            <button type="button" onClick={() => handleRemoveTag(tag)}>
              X
            </button>
          </div>
        ))}
      </div>
      <input
        type="text"
        placeholder="Tags"
        value={currentTag}
        onChange={(e) => setCurrentTag(e.target.value)}
      />
      <div className={styles.buttonGroup}>
        <button type="button" onClick={handleAddTag}>
          Add Tag
        </button>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Submitting..." : "Edit Post"}
        </button>
      </div>

      {isError && <div className={styles.error}>Error: {error.message}</div>}
      {isSuccess && (
        <div className={styles.success}>
          {data?.message || "Post editado exitosamente"}
        </div>
      )}
    </form>
  );
}
export default EditPost;
