import { useState, useEffect, useRef } from "react";
import { usePostById, useEditPost } from "../../api/blogApi";
import { useParams, useNavigate } from "react-router";
import styles from "./editPost.module.css";
import { Color } from "@tiptap/extension-color";
import { Image } from "@tiptap/extension-image";
import TextStyle from "@tiptap/extension-text-style";
import { EditorProvider } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { MenuBar } from "./CreatePostComponent/components/MenuBar";

const extensions = [
  Color.configure({ types: [TextStyle.name] }),
  TextStyle,
  StarterKit.configure({
    bulletList: { keepMarks: true, keepAttributes: false },
    orderedList: { keepMarks: true, keepAttributes: false },
    gapcursor: false,
  }),
  Image.configure({
    HTMLAttributes: { class: "tiptap-image" },
    inline: true,
    allowBase64: false,
  }),
];

function EditPost() {
  const { id } = useParams();
  const { data: postData } = usePostById(id);
  const post = postData?.post;
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState("");
  const editorRef = useRef(null);

  const { mutate, isPending, isSuccess, isError, error } = useEditPost();

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate({
      id,
      title,
      content: editorRef.current?.getHTML() || post.content,
      tags,
    });
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  useEffect(() => {
    if (isSuccess) {
      const timeout = setTimeout(() => navigate("/admin/post"), 2000);
      return () => clearTimeout(timeout);
    }
  }, [isSuccess, navigate]);

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setTags((post.postTags || []).map((tag) => tag.name));
    }
  }, [post]);

  if (!post) return <p>Loading...</p>;

  return (
    <form onSubmit={handleSubmit} className={styles.editContainer}>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <EditorProvider
        extensions={extensions}
        key={post.id}
        content={post.content}
        editorProps={{ attributes: { class: styles.tiptapEditor } }}
        slotBefore={<MenuBar />}
        onUpdate={({ editor }) => {
          editorRef.current = editor;
        }}
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
        placeholder="Add a tag"
        value={currentTag}
        onChange={(e) => setCurrentTag(e.target.value)}
      />

      <div className={styles.buttonGroup}>
        <button type="button" onClick={handleAddTag} className={styles.secondaryButton}>
          Add Tag
        </button>
        <button type="submit" disabled={isPending} className={styles.actionButton}>
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {isError && <div className={styles.error}>Error: {error.message}</div>}
      {isSuccess && <div className={styles.success}>Post updated successfully</div>}
    </form>
  );
}

export default EditPost;
