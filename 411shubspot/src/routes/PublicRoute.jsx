// src/routes/PublicRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function PublicRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated === null) return null;
  return isAuthenticated ? <Navigate to="/home" /> : <Outlet />;
}
