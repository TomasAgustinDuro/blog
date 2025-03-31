import { useState } from "react";
import { useInsertComment } from "../api/blogApi";

function Comments() {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  const { mutate, isLoading, onSuccess, onError } = useInsertComment();

  const handleSubmit = (e) => {
    e.preventDefault();

    const newComment = { name, content };

    mutate(newComment);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="name"
        value={name} // Usamos `user` en lugar de `title`
        onChange={(e) => setName(e.target.value)}
      />
      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Submitting..." : "Send Comment"}
      </button>

      {/* Mostrar error si ocurre */}
      {onError && <div>Error: {onError.message}</div>}

      {/* Mensaje cuando el comentario se envía con éxito */}
      {onSuccess && <div>{onSuccess.message}</div>}
    </form>
  );
}

export default Comments;
