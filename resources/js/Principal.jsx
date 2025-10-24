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

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    fetch("http://127.0.0.1:8000/api/departamentos", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        // Transformamos cada área para agregarle icono
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
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [navigate]);

  const handleSelect = (depId, depNombre) => {
    if (depId) {
      navigate(`/DepProSuperUsuario/${depId}`, { state: { nombre: depNombre } });
      setOpenDropdown(null);
    }
  };

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
          <li className="menu-item" onClick={() => navigate("/")}>
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
                onClick={() =>
                  setOpenDropdown(openDropdown === area.id ? null : area.id)
                }
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
