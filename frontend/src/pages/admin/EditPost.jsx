import { useState, useEffect } from "react";
import { usePostById, useEditPost } from "../../api/blogApi";
import { useParams } from "react-router";

function EditPost() {
  const id = useParams();
  const { data: post } = usePostById(id);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState("");
  const { mutate, isLoading } = useEditPost();

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
    console.log(post);
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setTags(post.postTags.map((tag) => tag.name));
    }
  }, [post]);

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  console.log(tags);

  return (
    <div>
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
        <div>
          {tags.map((tag, index) => (
            <div>
              <p key={index}>{tag}</p>
              <button onClick={() => handleRemoveTag(tag)}>X</button>
            </div>
          ))}
        </div>
        <input
          type="text"
          placeholder="Tags"
          value={currentTag}
          onChange={(e) => setCurrentTag(e.target.value)}
        />
        <button onClick={handleAddTag}>Add Tag</button>
        <button disabled={isLoading}>
          {isLoading ? "Submitting..." : "Edit Post"}
        </button>
      </form>
    </div>
  );
}
export default EditPost;
