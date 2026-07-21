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
    error,
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
      <button type="submit" disabled={isPending} className={styles.button}>
        {isPending ? "Submitting..." : "Send Comment"}
      </button>

      {isError && <div>Error: {isError.message}</div>}

      {isSuccess && <div>{isSuccess.message}</div>}
    </form>
  );
}

export default Comments;
