import React, { useState, useEffect } from "react";
import {
  FaHome,
  FaFileAlt, 
  FaUsers,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ICON_SIZE = 30; // Tamaño consistente para todos los íconos

export default function Header({ sidebarCollapsed, onToggleSidebar }) {
  
  const [rol, setRol] = useState(null);
  const navigate = useNavigate();

  // Lógica de Rol
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user_data"));
    setRol(userData && userData.rol ? userData.rol.toLowerCase() : "usuario");
  }, []);

  // Lógica de Logout
  const handleLogout = () => {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user_data");
    navigate("/");
  };

  // Menú por Rol (Completo y con clase "icon")
  const menuPorRol = {
    superusuario: [ 
      { icon: <FaHome size={ICON_SIZE} className="icon" />, label: "Inicio", ruta: "/Principal" }, 
      { icon: <FaFileAlt size={ICON_SIZE} className="icon" />, label: "Reportes", ruta: "/ReporteSuperUsuario" }, 
      { icon: <FaUsers size={ICON_SIZE} className="icon" />, label: "Usuarios", ruta: "/Usuarios" },
    ],
    administrador: [
      { icon: <FaHome size={ICON_SIZE} className="icon" />, label: "Inicio", ruta: "/Principal" },
      { icon: <FaFileAlt size={ICON_SIZE} className="icon" />, label: "Reportes", ruta: "/ReportesAdmin" },
    ],
    jefe: [
      { icon: <FaHome size={ICON_SIZE} className="icon" />, label: "Inicio", ruta: "/Principal" },
      { icon: <FaFileAlt size={ICON_SIZE} className="icon" />, label: "Reportes", ruta: "/ReportesJefe" },
    ],
    usuario: [
      { icon: <FaHome size={ICON_SIZE} className="icon" />, label: "Inicio", ruta: "/Principal" },
    ],
  };

  const menu = menuPorRol[rol] || menuPorRol.usuario;

  return (
    <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
      <ul> 
        {menu.map((item, i) => (
          <li
            key={i}
            className="menu-item"
            onClick={() => {
              if (i === 0 && !sidebarCollapsed) {
                onToggleSidebar();
              }
              navigate(item.ruta);
            }}
          >
            {item.icon} 
            {!sidebarCollapsed && <span className="label">{item.label}</span>}
          </li>
        ))}
        
        {/* Botón de Cerrar sesión */}
        <li className="menu-item logout" onClick={handleLogout}>
          <FaUsers size={ICON_SIZE} className="icon" /> 
          {!sidebarCollapsed && <span className="label">Cerrar sesión</span>}
        </li>
      </ul> 
    </div>
  );
}