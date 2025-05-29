import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const loginUser = async ({ user, password }) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/login`, {
      user,
      password,
    });

    localStorage.setItem("token", response.data.token);
    return response.data;
  } catch (error) {
    throw new Error("Error al iniciar sesión: " + error.message);
  }
};

export const useLoginUser = (fetchUser) => {
  return useMutation({
    mutationFn: loginUser,
    onSuccess: async (data) => {
      await fetchUser(); // 👈 ¡forzamos que actualice el user en el contexto!
    },
    onError: (error) => {
      console.error("Error al iniciar sesión", error);
    },
  });
};
