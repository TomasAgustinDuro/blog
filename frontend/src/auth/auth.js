import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const loginUser = async ({ user, password }) => {
  try {
    console.log("Comenzando petición");

    const response = await axios.post(
      "http://localhost:3000/login",
      { user, password },
      { withCredentials: true }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    throw new Error("Error al iniciar sesión: " + error.message);
  }
};

export const useLoginUser = () => {
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      console.log("Login realizado exitosamente", data);
    },
    onError: (error) => {
      console.error("Error al iniciar sesión", error);
    },
  });
};
