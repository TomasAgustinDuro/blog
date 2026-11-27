import { useState, useEffect } from "react";
import { fetchClient } from "../api/fetchClient";
import { AuthContext } from "./authContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      setLoading(true);

      if (!localStorage.getItem("token")) {
        setUser(null);
        return;
      }

      // fetchClient adjunta el token guardado en el header Authorization
      const currentUser = await fetchClient("/me");

      setUser(currentUser.username);
    } catch (error) {
      console.error("Error al obtener el usuario:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, fetchUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
