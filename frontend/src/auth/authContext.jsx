import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(res.data.username);
    } catch (error) {
      console.error("Error al obtener el usuario:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      fetchUser(); // solo si hay token lo traemos
    } else {
      setLoading(false); // importante: que no quede colgado el loading
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, fetchUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
