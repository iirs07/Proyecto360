import React from 'react';
import { FaHome } from 'react-icons/fa';
import "../../css/global.css";

export default function HeaderGlobal({ onToggleSidebar, title }) { 
  return (
    <div className="header-global">
      <div className="header-left" onClick={onToggleSidebar}>
        <FaHome className="icono-casa-global" /> 
      </div>
      <div className="barra-center">
        <span className="titulo-barra-global">{title}</span> 
      </div>
      <div className="header-right">
        {/* Espacio derecho opcional */}
      </div>
    </div>
  );
}