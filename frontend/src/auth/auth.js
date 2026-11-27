import { useMutation } from "@tanstack/react-query";
import { fetchClient } from "../api/fetchClient";

const loginUser = async ({ user, password }) => {
  const loginResponse = await fetchClient("/login", {
    method: "POST",
    body: JSON.stringify({ user, password }),
  });

  localStorage.setItem("token", loginResponse.token);
  return loginResponse;
};

export const useLoginUser = (fetchUser) => {
  return useMutation({
    mutationFn: loginUser,
    onSuccess: async () => {
      await fetchUser();
    },
  });
};
