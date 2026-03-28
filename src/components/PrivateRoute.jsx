import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const PrivateRoute = ({ children, role }) => {
  const navigate = useNavigate();
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const fetchedRole = atob(localStorage.getItem("role"));
    if (role && fetchedRole !== role) {
      navigate("/", { replace: true });
    }
  }, [navigate, role]);

  // Prevent rendering while checks are happening
  if (!localStorage.getItem("token")) return null;
  
  const fetchedRole = atob(localStorage.getItem("role"));
  if (role && fetchedRole !== role) return null;

  return children;
};

export default PrivateRoute;
