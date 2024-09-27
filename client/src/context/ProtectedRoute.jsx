import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { LoginContext } from "./LoginProvider";

export default function ProtectedRoute({ children }) {
  const { currentLogin } = useContext(LoginContext);

  // check if login is valid, redirecting to home if not
  if (!currentLogin) {
    return <Navigate to="/" replace />;
  }
  // if login is valid, return child elements
  return children;
}
