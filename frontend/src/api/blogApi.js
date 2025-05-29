import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

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

// Create post
const createPosts = async (body) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/post/create`,
      body,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al crear el post");
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

// Edit post
const editPosts = async (body) => {
  const id = body.id;
  try {
    const response = await axios.put(
      `${import.meta.env.VITE_API_URL}/post/edit/${id}`,
      body,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al editar el post");
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

// Get post by ID
const fetchPostById = async (id) => {
  console.log("id", id);
  try {
    console.log("id", id);
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/post/${id}`
    );
    return response.data.post;
  } catch (error) {
    console.log("id", id);
    throw new Error(
      error.response?.data?.message || "Error al obtener el post"
    );
  }
};

export const usePostById = (id) => {
  console.log("id use", id);
  return useQuery({
    queryKey: ["post", id],
    queryFn: () => fetchPostById(id),
  });
};

// Delete post
const deletePost = async (id) => {
  try {
    const response = await axios.delete(
      `${import.meta.env.VITE_API_URL}/post/delete/${id}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Error al eliminar el post"
    );
  }
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePost,
    onSuccess: (data) => {
      console.log("Post eliminado exitosamente", data);
      queryClient.invalidateQueries(["post"]);
    },
    onError: (error) => {
      console.error("Error al eliminar el post", error);
    },
  });
};

// Insert comment
const insertComment = async (body) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/comments/create`,
      body
    );
    return response;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Error al crear el comentario"
    );
  }
};

export const useInsertComment = (postId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: insertComment,
    onSuccess: (data) => {
      console.log("Comentario creado exitosamente", data);
      queryClient.invalidateQueries(["post", Number(postId)]); // 👈 Refresca
    },
    onError: (error) => {
      console.error("Error al crear el comentario", error);
    },
  });
};

const deleteComment = async (id) => {
  try {
    const response = await axios.delete(
      `${import.meta.env.VITE_API_URL}/comments/delete/${id}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Error al eliminar el comentario"
    );
  }
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteComment,
    onSuccess: (data) => {
      console.log("Comment eliminado exitosamente", data);
      queryClient.invalidateQueries(["comment"]);
    },
    onError: (error) => {
      console.error("Error al eliminar el comentario", error);
    },
  });
};
