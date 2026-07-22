import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchClient } from "./fetchClient";

// Obtain posts
const fetchPosts = async () => fetchClient("/posts");

export const usePosts = () => {
  return useQuery({
    queryKey: ["post"],
    queryFn: fetchPosts,
    staleTime: 1000 * 60 * 5,
  });
};

const fetchPaginatedPosts = async (page = 1) => fetchClient(`/posts?page=${page}`);

export const usePaginatedPosts = (page = 1) => {
  return useQuery({
    queryKey: ["post", page],
    queryFn: () => fetchPaginatedPosts(page),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
  });
};

// Create post
const createPost = async (body) =>
  fetchClient("/posts", { method: "POST", body: JSON.stringify(body) });

export const useCreatePosts = () => {
  return useMutation({
    mutationFn: createPost,
  });
};

// Edit post
const editPost = async (body) =>
  fetchClient(`/posts/${body.id}`, { method: "PUT", body: JSON.stringify(body) });

export const useEditPost = () => {
  return useMutation({
    mutationFn: editPost,
  });
};

// Get post by ID
const fetchPostById = async (id) => fetchClient(`/posts/${id}`);

export const usePostById = (id) => {
  return useQuery({
    queryKey: ["post", id],
    queryFn: () => fetchPostById(id),
  });
};

// Delete post
const deletePost = async (id) =>
  fetchClient(`/posts/${id}`, { method: "DELETE" });

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
const insertComment = async (body) =>
  fetchClient(`/comments/${body.postId}`, { method: "POST", body: JSON.stringify(body) });

export const useInsertComment = (postId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: insertComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post", Number(postId)] });
    },
  });
};

// Delete comment
const deleteComment = async (id) =>
  fetchClient(`/comments/${id}`, { method: "DELETE" });

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post"] });
    },
  });
};
