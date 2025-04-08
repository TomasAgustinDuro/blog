import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../src/auth/authContext";

const ProtectedRoutes = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  // Mientras está cargando, muestra un indicador de carga
  if (loading) {
    return <p>Cargando...</p>;
  }
  
  // Si no hay usuario después de cargar, redirige al login
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // Si hay usuario, muestra el contenido protegido
  return children;
};

export default ProtectedRoutes;