import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Obtain posts
const fetchPosts = async () => {
  try {
    const response = await axios.get(`${baseURL}/post`);
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
    const response = await axios.get(`${baseURL}/post?page=${page}`);
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
    const response = await axios.post(`${baseURL}/post/create`, body, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al crear el post");
  }
};

export const useCreatePosts = () => {
  return useMutation({
    mutationFn: createPosts,
  });
};

// Edit post
const editPosts = async (body) => {
  const id = body.id;
  try {
    const response = await axios.put(`${baseURL}/post/edit/${id}`, body, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al editar el post");
  }
};

export const useEditPost = () => {
  return useMutation({
    mutationFn: editPosts,
  });
};

// Get post by ID
const fetchPostById = async (id) => {
  try {
    const response = await axios.get(`${baseURL}/post/${id}`);
    return response.data.post;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Error al obtener el post"
    );
  }
};

export const usePostById = (id) => {
  return useQuery({
    queryKey: ["post", id],
    queryFn: () => fetchPostById(id),
  });
};

// Delete post
const deletePost = async (id) => {
  try {
    const response = await axios.delete(`${baseURL}/post/delete/${id}`, {
      headers: getAuthHeaders(),
    });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post"] });
    },
  });
};

// Insert comment
const insertComment = async (body) => {
  try {
    const response = await axios.post(`${baseURL}/comments/create`, body);
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post", Number(postId)] });
    },
  });
};

const deleteComment = async (id) => {
  try {
    const response = await axios.delete(`${baseURL}/comments/delete/${id}`, {
      headers: getAuthHeaders(),
    });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post"] });
    },
  });
};
