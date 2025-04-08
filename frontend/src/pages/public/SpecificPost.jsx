import { useParams } from "react-router-dom";
import { usePostById } from "../../api/blogApi";
import Comments from "../../components/InsertComments";
import styles from "./SpecificPost.module.css";
import Navbar from '../../components/navbar'

function SpecificPost() {
  const { id } = useParams();
  const { data: post, error, isLoading } = usePostById(id);

  if (isLoading) return <p>Cargando...</p>;
  if (error) return <p>Error al cargar el post.</p>;
  if (!post) return <p>No se encontró el post.</p>;

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.card}>
        <h3 className={styles.title}>{post.title}</h3>
        <p className={styles.content}>{post.content}</p>
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

        <hr className={styles.divider} />

        <div className={styles.comments}>
          {Array.isArray(post.comments) && post.comments.length > 0 ? (
            post.comments.map((comment) => (
              <div key={comment.id} className={styles.comment}>
                <p className={styles.commentAuthor}>{comment.name}</p>
                <p className={styles.commentText}>{comment.content}</p>
              </div>
            ))
          ) : (
            <p className={styles.noComments}>No comments</p>
          )}
        </div>
      </div>

      <Comments />
    </div>
  );
}
export default SpecificPost;
