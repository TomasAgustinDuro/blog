import { useState } from "react";
import { useInsertComment } from "../api/blogApi";
import {
  COMMENT_CONTENT_MAX_LENGTH,
  COMMENT_NAME_MAX_LENGTH,
} from "../constants/validationLimits";
import styles from "./comments.module.css";

function Comments({ postId }) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  const {
    mutate: insertComment,
    isPending,
    isSuccess,
    isError,
    error,
  } = useInsertComment(postId);

  const handleSubmit = (e) => {
    e.preventDefault();

    const newComment = { name, content, postId };

    insertComment(newComment, {
      onSuccess: () => {
        setName("");
        setContent("");
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} aria-label="Comment form">
      <label htmlFor="comment-name" className={styles.label}>Name</label>
      <input
        id="comment-name"
        type="text"
        placeholder="Your name"
        value={name}
        maxLength={COMMENT_NAME_MAX_LENGTH}
        onChange={(e) => setName(e.target.value)}
        className={styles.input}
      />
      <label htmlFor="comment-content" className={styles.label}>Comment</label>
      <textarea
        id="comment-content"
        placeholder="Write your comment..."
        value={content}
        maxLength={COMMENT_CONTENT_MAX_LENGTH}
        onChange={(e) => setContent(e.target.value)}
        className={styles.textarea}
      />
      <small>
        {content.length}/{COMMENT_CONTENT_MAX_LENGTH} caracteres
      </small>
      <button type="submit" disabled={isPending} className={styles.button}>
        {isPending ? "Submitting..." : "Send Comment"}
      </button>

      {isError && <div role="alert">{error.message}</div>}
      {isSuccess && <div role="status">Comment submitted successfully</div>}
    </form>
  );
}

export default Comments;
