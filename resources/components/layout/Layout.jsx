import React, { useState } from "react"; 
import Header from "./Header";
import HeaderGlobal from "./HeaderGlobal";
import "../../css/global.css";
import logo3 from "../../imagenes/logo3.png"; // Importar el logo para el fondo

export default function Layout({ children, pageTitle = "Título por Defecto" }) { 
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); 
  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  return (
    <div className="main-layout">     
      {/* 1. Sidebar */}
      <Header 
        sidebarCollapsed={sidebarCollapsed} 
        onToggleSidebar={toggleSidebar} 
      />

      <div className={`main-content ${sidebarCollapsed ? "collapsed" : ""}`}>
        
        {/* Logo de Fondo (Visible en todas las páginas) */}
        <div className="logo-fondo"> 
            <img src={logo3} alt="Fondo" />
        </div>

        {/* 2. Barra Superior Fija */}
        <HeaderGlobal 
            onToggleSidebar={toggleSidebar} 
            title={pageTitle}
        />        
        
        {/* 3. Contenido de la Página */}
        <div className="page-content-wrapper">
            {children}
        </div>
        
      </div>
    </div>
  );
}