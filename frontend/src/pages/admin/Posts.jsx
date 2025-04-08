import { useDeletePost, usePosts } from "../../api/blogApi";
import { useNavigate } from "react-router";
import Comments from "../../components/InsertComments";

function Posts() {
  const { data, error, isLoading } = usePosts();
  const { mutate, onError, onSucess } = useDeletePost();
  const navigate = useNavigate();

  if (isLoading) return <div>Loading...</div>;

  if (error) return <div>Error: {error.message}</div>;

  const dataPosts = data.posts;

  const handleEdit = (id) => {
    // Redirige al formulario de edición del post
    navigate(`/edit/${id}`);
  };

  const handleInsert = () => {
    // Redirige a la página de creación de un nuevo post
    navigate("/create");
  };

  const handleDelete = (id) => {
    mutate(id);
  };

  return (
    <div>
      {Array.isArray(dataPosts) ? (
        dataPosts.map((dato) => (
          <div key={dato.id}>
            <h3>{dato.title}</h3>
            <p>{dato.content}</p>
            <img src={dato.image} alt="" />
            <div>
              {Array.isArray(dato.postTags) && dato.postTags.length > 0 ? (
                dato.postTags.map((tag) => (
                  <span
                    key={tag.id}
                  >
                    #{tag.name}
                  </span>
                ))
              ) : (
                <p>No tags</p>
              )}
            </div>
            <div>
              {Array.isArray(dato.comments) && dato.comments.length > 0 ? (
                dato.comments.map((comment) => (
                  <span
                    key={comment.id}
                  >
                    {comment.name}
                    {comment.content}
                  </span>
                ))
              ) : (
                <p>No tags</p>
              )}
            </div>
            <button onClick={() => handleEdit(dato.id)}>Editar</button>
            <button onClick={() => handleDelete(dato.id)}>Eliminar</button>
          </div>
        ))
      ) : (
        <div>No posts available</div>
      )}
      <button onClick={() => handleInsert()}>Agregar nueva entrada</button>
    </div>

   
  );
}

export default Posts;
