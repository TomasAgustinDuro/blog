import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// Obtain posts
const fetchPosts = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/post`);
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
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/post?page=${page}`
    );

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
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/post/create`,
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
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/post/${id}`
    );
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
    const response = await axios.delete(
      `${import.meta.env.VITE_API_URL}/post/delete/${id}`,
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
      `${import.meta.env.VITE_API_URL}/comments/create`,
      body
    );

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
