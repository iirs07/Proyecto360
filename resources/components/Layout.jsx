import React, { useState } from "react";
import { FaHome, FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import logo3 from "../imagenes/logo3.png";
import "../css/global.css";

// ... (documentación y export default function Layout...)

export default function Layout({ titulo, children, ...rest }) {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  const handleLogout = () => {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("last_depId");
    localStorage.removeItem("user_role");
    navigate("/Login", { replace: true });
  };
    
  return (
    <div className="main-layout">
      
      {/* 1. Sidebar Contenedor (Sin cambios) */}
      <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        {
            rest.sidebar ? 
            React.cloneElement(rest.sidebar, { 
                ...rest,
                onLogout: handleLogout
            })
            : null
        }
      </div>

      {/* 2. Contenido principal y marco (Sin cambios) */}
      <div className={`main-content ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="logo-fondo">
          <img src={logo3} alt="Fondo" />
        </div>

        {/* 3. Encabezado Global */}
        <div className="header-global">
            <div className="header-left" onClick={toggleSidebar}>
                <FaHome className="icono-casa-global" />
            </div>
            <div className="barra-center">
                <span className="titulo-barra-global">{titulo.toUpperCase()}</span>
            </div>
        </div>
        
        {/* 4. Contenido Específico de la Página (Sin cambios) */}
        <div className="page-content-wrapper">
          {children}
        </div>
      </div>
    </div>
  );
}