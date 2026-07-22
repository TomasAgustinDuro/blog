import { useState } from "react";
import { useInsertComment } from "../api/blogApi";
import styles from "./comments.module.css";

function Comments({ postId }) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  const {
    mutate: insertComment,
    isPending,    // en React Query v5 se llama isPending, no isPending
    isSuccess,
    isError,
  } = useInsertComment();

  const handleSubmit = (e) => {
    e.preventDefault();

    const newComment = { name, content, post_id: postId };

    insertComment(newComment, {
      isSuccess: () => {
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
        onChange={(e) => setName(e.target.value)}
        className={styles.input}
      />
      <label htmlFor="comment-content" className={styles.label}>Comment</label>
      <textarea
        id="comment-content"
        placeholder="Write your comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className={styles.textarea}
      />
      <button type="submit" disabled={isPending} className={styles.button}>
        {isPending ? "Submitting..." : "Send Comment"}
      </button>

      {isError && <div role="alert">Error submitting comment</div>}

      {isSuccess && <div role="status">Comment submitted successfully</div>}
    </form>
  );
}

export default Comments;
