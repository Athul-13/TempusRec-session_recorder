import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import Loader from "./Loader"; // Import the same Loader from Home

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Give Redux state time to hydrate from localStorage if that's how you're persisting auth
    const timer = setTimeout(() => {
      setCheckingAuth(false);
    }, 500); // Shorter delay, just enough to let Redux initialize

    return () => clearTimeout(timer);
  }, []);

  // Show the same loader as in Home.jsx for consistency
  if (checkingAuth) {
    return <Loader />;
  }

  // Only redirect if we're done checking and not authenticated
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;