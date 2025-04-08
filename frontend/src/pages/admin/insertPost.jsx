import React, { useState, useEffect } from "react";
import { useCreatePosts } from "../../api/blogApi";
import styles from "./insertPost.module.css";
import { useNavigate } from "react-router";


function CreatePostForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState("");
  const navigate = useNavigate()

  const { mutate, isLoading, isSuccess, isError, error } = useCreatePosts();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Creamos el nuevo post
    const newPost = { title, content, tags };

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
      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
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
        <div className={styles.success}>
          {'Post creado exitosamente'}
        </div>
      )}
      {isError && <div className={styles.error}>Error: {error.message}</div>}
    </form>
  );
}

export default CreatePostForm;
