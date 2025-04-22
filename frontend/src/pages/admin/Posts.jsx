import { useDeletePost, usePosts, useDeleteComment } from "../../api/blogApi";
import { useNavigate } from "react-router";
import styles from "./adminPost.module.css";

function Posts() {
  const { data, error, isLoading } = usePosts();
  const { mutate: deletePost, onError, onSucess } = useDeletePost();
  const { mutate: deleteComment, isError, isSucess } = useDeleteComment();
  const navigate = useNavigate();

  if (isLoading) return <div>Loading...</div>;

  if (error) return <div>Error: {error.message}</div>;

  const dataPosts = data.posts;

  const handleDeletePost = (id) => {
    deletePost(id);
  };

  const handleDeleteComment = (id) => {
    if (confirm("¿Desea eliminar este comentario?")) {
      deleteComment(id);
    }
  };

  const getTruncatedText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    const cutIndex = text.indexOf(" ", maxLength);
    return text.slice(0, cutIndex > -1 ? cutIndex : maxLength) + "...";
  };
  const getPlainText = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  return (
    <div className={styles.postContainer}>
      {Array.isArray(dataPosts) ? (
        dataPosts.map((dato) => (
          <div key={dato.id} className={styles.postCard}>
            <h3>{dato.title}</h3>
            <p>{getTruncatedText(getPlainText(dato.content), 200)}</p>
            <img src={dato.image} alt="" />
            <div>
              {Array.isArray(dato.postTags) && dato.postTags.length > 0 ? (
                dato.postTags.map((tag) => (
                  <span key={tag.id}> #{tag.name}</span>
                ))
              ) : (
                <p>No tags</p>
              )}
            </div>
            <div className={styles.comments}>
              {Array.isArray(dato.comments) && dato.comments.length > 0 ? (
                dato.comments.map((comment) => (
                  <div key={comment.id} className={styles.comment}>
                    <div className={styles.textComment}>
                      <p className={styles.commentAuthor}>{comment.name}</p>
                      <p className={styles.commentText}>{comment.content}</p>
                    </div>
                    <button onClick={() => handleDeleteComment(comment.id)}>
                      X
                    </button>
                  </div>
                ))
              ) : (
                <p className={styles.noComments}>No comments</p>
              )}
            </div>
            <button
              onClick={() => {
                navigate(`/admin/edit/${dato.id}`);
              }}
            >
              Editar
            </button>

            <button onClick={() => handleDeletePost(dato.id)}>Eliminar</button>
          </div>
        ))
      ) : (
        <div>No posts available</div>
      )}
    </div>
  );
}

export default Posts;
