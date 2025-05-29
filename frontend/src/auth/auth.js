import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const loginUser = async ({ user, password }) => {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}/login`, {
    user,
    password,
  });
  // No seteamos el token acá
  return response.data;
};

export const useLoginUser = () => {
  return useMutation({
    mutationFn: loginUser,
    onError: (error) => {
      console.error("Error al iniciar sesión", error);
    },
  });
};
