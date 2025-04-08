import { useDeletePost, usePosts } from "../../api/blogApi";
import { useNavigate } from "react-router";
import styles from './adminPost.module.css'

function Posts() {
  const { data, error, isLoading } = usePosts();
  const { mutate, onError, onSucess } = useDeletePost();
  const navigate = useNavigate();

  if (isLoading) return <div>Loading...</div>;

  if (error) return <div>Error: {error.message}</div>;

  const dataPosts = data.posts;

  const handleDelete = (id) => {
    mutate(id);
  };

  return (
    <div className={styles.postContainer}>
      {Array.isArray(dataPosts) ? (
        dataPosts.map((dato) => (
          <div key={dato.id} className={styles.postCard}>
            <h3>{dato.title}</h3>
            <p>
              {dato.content.length > 150
                ? dato.content.slice(0, dato.content.indexOf(" ", 150)) + "..."
                : dato.content}
            </p>
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
            <div>
              {Array.isArray(dato.comments) && dato.comments.length > 0 ? (
                dato.comments.map((comment) => (
                  <span key={comment.id}>
                    {comment.name}
                    {comment.content}
                  </span>
                ))
              ) : (
                <p>No comments</p>
              )}
            </div>
            <button
              onClick={() => {
                console.log(typeof dato.id);
                navigate(`/admin/edit/${dato.id}`);
              }}
            >
              Editar
            </button>

            <button onClick={() => handleDelete(dato.id)}>Eliminar</button>
          </div>
        ))
      ) : (
        <div>No posts available</div>
      )}
    </div>
  );
}

export default Posts;
