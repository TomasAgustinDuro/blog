import { useNavigate } from "react-router";
import { usePaginatedPosts } from "../../api/blogApi";
import styles from "./publicPosts.module.css";
import Pagination from "../../components/pagination";
import { useState } from "react";
import Spinner from "../../components/spinnner";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const TruncatedEditor = ({ html, maxLength = 200 }) => {
  // Cortar el contenido (similar a Opción 1)
  const truncatedContent =
    html.length > maxLength
      ? html.slice(0, html.indexOf(" ", maxLength)) + "..."
      : html;

  const editor = useEditor({
    extensions: [StarterKit],
    content: truncatedContent,
    editable: false, 
  });

  return <EditorContent editor={editor} className={styles.content} />;
};

function PublicPosts() {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);

  const { data, error, isLoading } = usePaginatedPosts(page);

  if (isLoading) return <Spinner />;

  if (error) return <div>Error: {error.message}</div>;

  const handleSeeMore = (id) => {
    navigate(`/post/${id}`);
  };

  return (
    <div>
      {Array.isArray(data.posts) ? (
        data.posts.map((post) => (
          <div key={post.id} className={styles.publicPostsContainer}>
            <h3>{post.title}</h3>
            <TruncatedEditor html={post.content} />
            <img src={post.image} alt="" />
            <button
              className={styles.button}
              onClick={() => handleSeeMore(post.id)}
            >
              Ver más
            </button>
            <div className={styles.contenedorTags}>
              {Array.isArray(post.postTags) && post.postTags.length > 0 ? (
                post.postTags.map((tag) => (
                  <span key={tag.id}> #{tag.name}</span>
                ))
              ) : (
                <p>No tags</p>
              )}
            </div>
            <div className={styles.contenedorComentarios}>
              {Array.isArray(post.comments) && post.comments.length > 0 ? (
                post.comments.map((comment) => (
                  <div className={styles.comentario} key={comment.id}>
                    <h3>{comment.name}</h3>
                    <p>{comment.content}</p>
                  </div>
                ))
              ) : (
                <h3>No comments</h3>
              )}
            </div>
          </div>
        ))
      ) : (
        <div>No post available</div>
      )}

      <Pagination
        totalPages={data.pagination.totalPages}
        currentPage={page}
        onPageChange={setPage}
      />
    </div>
  );
}
export default PublicPosts;
