import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  // Intenta obtener el token JWT.
  const token = localStorage.getItem("jwt_token");

  // Si el token EXISTE, permite que se cargue la ruta anidada (el <Outlet> cargará Principal, ReporteSuperUsuario, etc.).
  if (token) {
    return <Outlet />;
  }
  
  // Si el token NO EXISTE, redirige inmediatamente al login.
  return <Navigate to="/Login" replace />;
}