import { Navigate, useLocation } from "react-router-dom";

const withAuth = (WrappedComponent) => {
  return (props) => {
    const token = localStorage.getItem("token");
    const location = useLocation();

    // Allow access to login page (root "/")
    if (location.pathname === "/" && !token) {
      return <WrappedComponent {...props} />;
    }

    // Redirect to login if no token and not on login page
    if (!token) {
      return <Navigate to="/" replace />;
    }

    // Proceed to the wrapped component if authenticated
    return <WrappedComponent {...props} />;
  };
};

export default withAuth;