import { useNavigate } from "react-router";
import { usePosts } from "../api/blogApi";
import styles from "./lastPost.module.css";
import Spinner from "./spinnner";

function LastPosts() {
  const { data, error, isLoading } = usePosts();
  const navigate = useNavigate();


  if (isLoading) return <Spinner />

  if (error) return <div>Error: {error.message}</div>;

  const lastPosts = data.posts.slice(0, 5);

  const handleSeeMore = (id) => {
    navigate(`/post/${id}`);
  };

  return (
    <div className={styles.container}>
      {Array.isArray(lastPosts) ? (
        lastPosts.map((post) => (
          <div key={post.id} className={styles.card}>
            <h3 className={styles.title}>{post.title}</h3>
            <p className={styles.content}>
              {post.content.length > 150
                ? post.content.slice(0, post.content.indexOf(" ", 150)) + "..."
                : post.content}
            </p>
            <img src={post.image} alt="" className={styles.image} />
            <div className={styles.tags}>
              {Array.isArray(post.postTags) && post.postTags.length > 0 ? (
                post.postTags.map((tag) => (
                  <span key={tag.id} className={styles.tag}>
                    #{tag.name}
                  </span>
                ))
              ) : (
                <p>No tags</p>
              )}
            </div>
            <div className={styles.comments}>
              {Array.isArray(post.comments) && post.comments.length > 0 && (
                <p>
                  {post.comments.length}{" "}
                  {post.comments.length === 1 ? "comentario" : "comentarios"}
                </p>
              )}
            </div>
            <button
              className={styles.button}
              onClick={() => handleSeeMore(post.id)}
            >
              Ver más
            </button>
          </div>
        ))
      ) : (
        <div>No post available</div>
      )}
    </div>
  );
}
export default LastPosts;
