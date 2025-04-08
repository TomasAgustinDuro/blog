import { useState, useEffect } from "react";
import { usePostById, useEditPost } from "../../api/blogApi";
import { useParams } from "react-router";
import styles from "./editPost.module.css";
import { useNavigate } from "react-router";

function EditPost() {
  const { id } = useParams();
  const { data: post } = usePostById(id);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState("");
  const { mutate, isLoading, isSuccess, isError, error, data } = useEditPost();

  // Manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();

    const body = { id, title, content, tags };
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
      setContent(post.content);
      setTags(post.postTags.map((tag) => tag.name));
    }
  }, [post]);

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className={styles.editContainer}>
      <h2>Editar</h2>
      <form onSubmit={handleSubmit}>
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
      </form>

      {isError && <div className={styles.error}>Error: {error.message}</div>}
      {isSuccess && (
        <div className={styles.success}>
          {data?.message || "Post editado exitosamente"}
        </div>
      )}
    </div>
  );
}
export default EditPost;
