import { usePosts } from "../../api/blogApi";
import styles from './publicPosts.module.css'

function PublicPosts() {
  const { data, error, isLoading } = usePosts();

  if (isLoading) return <div>Loading...</div>;

  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {Array.isArray(data.posts) ? (
        data.posts.map((post) => (
          <div key={post.id} className={styles.publicPostsContainer}>
            <h3>{post.title}</h3>
            <p>{post.content}</p>
            <img src={post.image} alt="" />
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
    </div>
  );
}
export default PublicPosts;
