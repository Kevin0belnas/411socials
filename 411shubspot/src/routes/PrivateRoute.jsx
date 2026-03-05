// import { Navigate, Outlet } from 'react-router-dom';
// import useAuth from '../hooks/useAuth';

// export default function PrivateRoute() {
//   const { isAuthenticated } = useAuth();

//   if (isAuthenticated === null) return null;

//   return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
// }



// routes/PrivateRoute.js
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function PrivateRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}