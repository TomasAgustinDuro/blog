import React, { useState } from "react";
import { useCreatePosts } from "../../api/blogApi";

function CreatePostForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState("");

 
  const { mutate, isLoading, onError, onSuccess } = useCreatePosts();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Creamos el nuevo post
    const newPost = { title, content, tags };

    console.log("Enviando post: ", newPost);

    // Ejecutamos la mutación con el post
    mutate(newPost);
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  return (
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
      <div>
        <input
          type="text"
          placeholder="Add a tag"
          value={currentTag}
          onChange={(e) => setCurrentTag(e.target.value)}
        />
        <button onClick={handleAddTag}>Add Tag</button>
      </div>
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Submitting..." : "Create Post"}
      </button>

      {/* Mostrar error si ocurre */}
      {onError && <div>Error: {onError.message}</div>}

      {/* Mensaje cuando el post se crea con éxito */}
      {onSuccess && onSuccess.message}
    </form>
  );
}

export default CreatePostForm;
