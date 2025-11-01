import React, { useState, useEffect } from "react";
import {
  FaHome,
  FaFileAlt,
  FaUsers,
  FaBuilding,
  FaWallet,
  FaTree,
  FaCog,
  FaGavel,
  FaHandsHelping,
  FaWater,
} from "react-icons/fa";
import "../css/global.css";
import "../css/Principal.css";
import logo3 from "../imagenes/logo3.png";
import { useNavigate } from "react-router-dom";

export default function Principal() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [areas, setAreas] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  // Obtener el token una sola vez
  const token = localStorage.getItem("jwt_token"); 

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);
  
  // 🟢 NUEVA FUNCIÓN: Genera un slug (URL amigable) a partir del nombre
  const createSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Elimina caracteres especiales
      .replace(/[\s_-]+/g, "-") // Reemplaza espacios y guiones múltiples por un solo guión
      .replace(/^-+|-+$/g, ""); // Elimina guiones al principio o al final
  };


  useEffect(() => {
    // **1. Primera verificación de token (seguridad extra)**
    if (!token) {
        console.log("Token no encontrado. Redirigiendo a login.");
        // Aseguramos que la navegación sea correcta si el token falla
        navigate("/Login", { replace: true });
        return;
    }

    setLoading(true);

    const fetchDepartamentos = async () => {
        try {
            const res = await fetch("http://127.0.0.1:8000/api/departamentos", {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            // **2. Manejo de Token expirado/inválido (Respuesta 401 del backend)**
            if (res.status === 401) {
                console.warn("Token inválido o expirado (401). Redirigiendo a login.");
                localStorage.removeItem("jwt_token"); // Limpiar el token malo
                navigate("/Login", { replace: true });
                return;
            }

            if (!res.ok) {
                throw new Error(`Error en la solicitud: ${res.status}`);
            }

            const data = await res.json();
            
            // Lógica para mapear íconos
            const mappedAreas = data.map((area) => ({
                ...area,
                icon: (() => {
                    switch (area.id) {
                        case 1: return <FaHome className="area-icono" />;
                        case 2: return <FaUsers className="area-icono" />;
                        case 3: return <FaBuilding className="area-icono" />;
                        case 4: return <FaWallet className="area-icono" />;
                        case 5: return <FaTree className="area-icono" />;
                        case 6: return <FaCog className="area-icono" />;
                        case 7: return <FaGavel className="area-icono" />;
                        case 8: return <FaHandsHelping className="area-icono" />;
                        case 9: return <FaBuilding className="area-icono" />;
                        case 10: return <FaWater className="area-icono" />;
                        default: return <FaFileAlt className="area-icono" />;
                    }
                })()
            }));
            
            setAreas(mappedAreas);

        } catch (err) {
            console.error("Error al obtener departamentos:", err);
        } finally {
            setLoading(false);
        }
    };
    
    fetchDepartamentos();

    // Dependencias del useEffect
  }, [navigate, token]); 

// En Principal.js, dentro de handleSelect(depId, depNombre):
const handleSelect = (depId, depNombre) => {
    const departamentoSlug = createSlug(depNombre);

    // 🔑 Guardar el ID en el localStorage ANTES de navegar
    localStorage.setItem('last_depId', depId); 

    // Navegar solo con el slug, y pasar el ID por state (el state es opcional ahora)
    navigate(`/proyectosenproceso/${departamentoSlug}`, { 
        state: { nombre: depNombre, depId: depId } 
    });
    setOpenDropdown(null);
};
  // Renderizado del Loader
  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader-logo">
          <img src={logo3} alt="Cargando" />
        </div>
        <div className="loader-texto">CARGANDO DEPARTAMENTOS..</div>
        <div className="loader-spinner"></div>
      </div>
    );
  }

  // Renderizado del Componente Principal
  return (
    <div className="main-layout">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <ul>
          <li className="menu-item" onClick={() => navigate("/Principal")}>
            <FaHome className="icon" />
            {!sidebarCollapsed && <span className="label">Inicio</span>}
          </li>
          <li className="menu-item" onClick={() => navigate("/ReporteSuperUsuario")}>
            <FaFileAlt className="icon" />
            {!sidebarCollapsed && <span className="label">Reportes</span>}
          </li>
          {/* **CERRAR SESIÓN MODIFICADO PARA LIMPIAR EL TOKEN** */}
          <li className="menu-item" onClick={() => {
            localStorage.removeItem("jwt_token"); // 🔑 Limpiar token
            navigate("/Login"); // Redirigir al login
          }}>
            <FaUsers className="icon" />
            {!sidebarCollapsed && <span className="label">Cerrar sesión</span>}
          </li>
        </ul>
      </div>

      {/* Contenido principal */}
      <div className={`main-content ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="logo-fondo">
          <img src={logo3} alt="Fondo" />
        </div>

        <div className="header-global">
          <div className="header-left" onClick={toggleSidebar}>
            <FaHome className="icono-casa-global" />
            {/* 💡 El logo de la casa también puede llevar a /Principal si lo desea */}
          </div>
          <div className="barra-center">
            <span className="titulo-barra-global">GESTIÓN DE DEPARTAMENTOS</span>
          </div>
        </div>

        <div className="areas-grid-departamentos" style={{ paddingTop: "20px" }}>
          {areas.map((area) => (
            <div key={area.id} className="area-item-departamentos">
              <div
                className="dropdown-btn-departamentos"
                onClick={() => setOpenDropdown(openDropdown === area.id ? null : area.id)}
              >
                {area.icon}
                <span>{area.nombre}</span>
              </div>
              {openDropdown === area.id && (
                <div className="dropdown-options-departamentos">
                  {area.departamentos.map((dep) => (
                    <div
                      key={dep.id_departamento}
                      className="option-item-departamentos"
                      // El ID y Nombre se pasan a handleSelect
                      onClick={() => handleSelect(dep.id_departamento, dep.d_nombre)}
                    >
                      {dep.d_nombre}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}