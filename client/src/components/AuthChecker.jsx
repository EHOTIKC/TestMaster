import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { isTokenValid } from "../utils/token.js";

export default function AuthChecker({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const publicPaths = ["/login", "/register", "/forgot-password", "/"];

    if (!isTokenValid() && !publicPaths.includes(location.pathname)) {
      
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.dispatchEvent(new Event("authChange"));
      navigate("/login");
    }
  }, [navigate, location.pathname]);

  return children;
}