import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { fetchClient } from "./fetchClient";

// Claves de caché: todas cuelgan de "post" para poder invalidarlas juntas,
// y cada tipo de consulta tiene su propio segmento para no pisarse entre sí.
const postKeys = {
  all: ["post"],
  list: () => ["post", "list"],
  page: (page) => ["post", "page", page],
  detail: (id) => ["post", "detail", String(id)],
};

// Obtain posts
const fetchPosts = async () => fetchClient("/posts");

export const usePosts = () => {
  return useQuery({
    queryKey: postKeys.list(),
    queryFn: fetchPosts,
    staleTime: 1000 * 60 * 5,
  });
};

const fetchPaginatedPosts = async (page = 1) => fetchClient(`/posts?page=${page}`);

export const usePaginatedPosts = (page = 1) => {
  return useQuery({
    queryKey: postKeys.page(page),
    queryFn: () => fetchPaginatedPosts(page),
    placeholderData: keepPreviousData,
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
    queryKey: postKeys.detail(id),
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
      queryClient.invalidateQueries({ queryKey: postKeys.all });
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
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
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
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
};
