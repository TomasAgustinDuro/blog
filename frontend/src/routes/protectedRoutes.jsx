import { useContext } from "react";
import { AuthContext } from "../auth/authContext";
import Login from "../pages/public/Login";
import Spinner from "../components/Spinner";

const ProtectedRoutes = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return <Spinner />;
  if (!user) return <Login />;
  
  return children;
};
export default ProtectedRoutes;