import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";



// Obtain posts
const fetchPosts = async () => {
  try {
    console.log("Comenzando petición");
    const response = await axios.get("http://localhost:3000/post");
    console.log(response.data);
    return response.data;
  } catch (error) {
    throw new Error("Error al obtener los posts: " + error.message);
  }
};

export const usePosts = () => {
  return useQuery({
    queryKey: ["post"],
    queryFn: fetchPosts,
    staleTime: 1000 * 60 * 5,
  });
};

// Obtain posts
const fetchPaginatedPosts = async (page = 1) => {
  try {
    console.log("Comenzando petición");
    const response = await axios.get(`http://localhost:3000/post?page=${page}`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    throw new Error("Error al obtener los posts: " + error.message);
  }
};

export const usePaginatedPosts = (page = 1) => {
  return useQuery({
    queryKey: ["post", page],
    queryFn: () => fetchPaginatedPosts(page),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
  });
};

// Create posts

const createPosts = async (body) => {
  try {
    console.log(body);
    const response = await axios.post(
      "http://localhost:3000/post/create",
      body,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("Error en la respuesta del servidor:", error.response.data);
      throw new Error(
        error.response.data.message || "Error desconocido en el servidor"
      );
    } else {
      console.error("Error en la request:", error.message);
      throw new Error("Error de red: " + error.message);
    }
  }
};

export const useCreatePosts = () => {
  return useMutation({
    mutationFn: createPosts,
    onSuccess: (data) => {
      console.log("Post creado exitosamente", data);
      
    },
    onError: (error) => {
      console.error("Error al crear el post", error);
    },
  });
};

// Edit posts
const editPosts = async (body) => {
  console.log("editpost", body.id);
  const id = body.id;
  try {
    const response = await axios.put(
      `http://localhost:3000/post/edit/${id}`,
      body,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("Error en la respuesta del servidor:", error.response.data);
      throw new Error(
        error.response.data.message || "Error desconocido en el servidor"
      );
    } else {
      console.error("Error en la request:", error.message);
      throw new Error("Error de red: " + error.message);
    }
  }
};

export const useEditPost = () => {
  return useMutation({
    mutationFn: editPosts,
    onSuccess: (data) => {
      console.log("Post editado exitosamente", data);

    },
    onError: (error) => {
      console.error("Error al editar el post", error);
    },
  });
};

// Obtain posts by id
const fetchPostById = async (id) => {
  try {
    console.log("ID enviado:", id);
    const response = await axios.get(`http://localhost:3000/post/${id}`);
    console.log(response.data.post);
    return response.data.post;
  } catch (error) {
    if (error.response) {
      console.error("Error en la respuesta del servidor:", error.response.data);
      throw new Error(
        error.response.data.message || "Error desconocido en el servidor"
      );
    } else {
      console.error("Error en la request:", error.message);
      throw new Error("Error de red: " + error.message);
    }
  }
};

export const usePostById = (id) => {
  return useQuery({
    queryKey: ["post", id],
    queryFn: () => fetchPostById(id),
  });
};

// Delete posts
const deletePost = async (id) => {
  try {
    console.log("ID que se envía al backend:", id); // Verificar el id
    const response = await axios.delete(
      `http://localhost:3000/post/delete/${id}`,
      { withCredentials: true }
    );
    console.log(response.data.post);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("Error en la respuesta del servidor:", error.response.data);
      throw new Error(
        error.response.data.message || "Error desconocido en el servidor"
      );
    } else {
      console.error("Error en la request:", error.message);
      throw new Error("Error de red: " + error.message);
    }
  }
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deletePost(id),
    onSuccess: (data) => {
      console.log("Post eliminado exitosamente", data);
      queryClient.invalidateQueries(["posts"]);
    },
    onError: (error) => {
      console.error("Error al eliminar el post", error);
    },
  });
};

const insertComment = async (body) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/comments/create",
      body
    );

    console.log(response.data);

    return response;
  } catch (error) {
    if (error.response) {
      console.error("Error en la respuesta del servidor:", error.response.data);
      throw new Error(
        error.response.data.message || "Error desconocido en el servidor"
      );
    } else {
      console.error("Error en la request:", error.message);
      throw new Error("Error de red: " + error.message);
    }
  }
};

export const useInsertComment = () => {
  return useMutation({
    mutationFn: insertComment,
    onSuccess: (data) => {
      console.log("Post creado exitosamente", data);
    },
    onError: (error) => {
      console.error("Error al crear el post", error);
    },
  });
};
