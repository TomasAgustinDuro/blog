import { useParams } from "react-router-dom";
import { usePostById } from "../../api/blogApi";
import Comments from "../../components/InsertComments";
import styles from "./specificPost.module.css";
import Spinner from "../../components/spinnner";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

function SpecificPost() {
  const { id } = useParams();

  const { data: post, error, isLoading } = usePostById(id);

  const editor = useEditor(
    {
      extensions: [StarterKit],
      content: post?.content || "", 
      editable: false,
    },
    [post]
  ); 

  if (isLoading) return <Spinner />;
  if (error) return <p>Error al cargar el post.</p>;
  if (!post) return <p>No se encontró el post.</p>;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h3 className={styles.title}>{post.title}</h3>
        {editor && <EditorContent editor={editor} className={styles.content} />}
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

      <Comments postId={id} />
    </div>
  );
}
export default SpecificPost;
