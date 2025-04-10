import { useState } from "react";
import { useInsertComment } from "../api/blogApi";
import styles from "./comments.module.css";

function Comments({ postId }) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  const {
    mutate: insertComment,
    isLoading,
    onSuccess,
    onError,
  } = useInsertComment();

  const handleSubmit = (e) => {
    e.preventDefault();

    const newComment = { name, content, post_id: postId };

    insertComment(newComment, {
      onSuccess: () => {
        setName("");
        setContent("");
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={styles.input}
      />
      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className={styles.textarea}
      />
      <button type="submit" disabled={isLoading} className={styles.button}>
        {isLoading ? "Submitting..." : "Send Comment"}
      </button>

      {onError && <div>Error: {onError.message}</div>}

      {onSuccess && <div>{onSuccess.message}</div>}
    </form>
  );
}

export default Comments;
