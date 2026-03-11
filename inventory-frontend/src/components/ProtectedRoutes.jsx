import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { access } = useContext(AuthContext);

  if (!access) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;