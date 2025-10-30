import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaTasks, FaProjectDiagram, FaUsers, FaCaretDown } from "react-icons/fa";
import logo3 from "../imagenes/logo3.png";
import "../css/DepProSuperUsuario.css";
import "../css/global.css";
import ProgresoProyecto from "./ProgresoProyecto";

export default function DepProCompletados() {
  const { depId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const departamentoNombre = location.state?.nombre || "Departamento";

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🟢 ESTADOS PARA ORDENAMIENTO
  const [sortBy, setSortBy] = useState("fechaFin"); // Criterio inicial
  const [sortDirection, setSortDirection] = useState("desc"); // Dirección inicial
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  // Función unificada para cambiar orden
  const handleSelectSort = (newSortBy, newSortDirection) => {
    setSortBy(newSortBy);
    setSortDirection(newSortDirection);
    setIsMenuOpen(false); // Cierra el menú
  };

  // Función para mostrar texto del botón principal
  const getSortButtonText = () => {
    const criterioMap = {
      fechaFin: "Fecha Finalización",
      fechaInicio: "Fecha Inicio",
      nombre: "Nombre",
    };
    const icon = sortDirection === "asc" ? " ▲ (Asc.)" : " ▼ (Desc.)";
    return `${criterioMap[sortBy] || "Fecha Finalización"} ${icon}`;
  };

  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchDatos = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/api/departamentos/${depId}/progresos`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // Filtrar por proyectos Finalizados
        const proyectosFinalizados = data.filter(
          (p) => p.p_estatus === "Finalizado" && p.total_tareas > 0
        );

        setProyectos(proyectosFinalizados);
      } catch (err) {
        console.error("Error al cargar proyectos finalizados:", err);
        setProyectos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDatos();
  }, [depId, navigate]);

  // Ordenamiento dinámico
  const proyectosOrdenados = [...proyectos].sort((a, b) => {
    let comparison = 0;
    const direction = sortDirection === "asc" ? 1 : -1;

    if (sortBy === "fechaFin") {
      comparison = new Date(a.pf_fin) - new Date(b.pf_fin);
    } else if (sortBy === "fechaInicio") {
      comparison = new Date(a.pf_inicio) - new Date(b.pf_inicio);
    } else if (sortBy === "nombre") {
      comparison = a.p_nombre.localeCompare(b.p_nombre);
    }

    return comparison * direction;
  });

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader-logo">
          <img src={logo3} alt="Cargando" />
        </div>
        <div className="loader-texto">CARGANDO PROYECTOS FINALIZADOS...</div>
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
          <li
            className="menu-item"
            onClick={() =>
              navigate(`/DepProSuperUsuario/${depId}`, { state: { nombre: departamentoNombre } })
            }
          >
            <FaTasks className="icon" />
            {!sidebarCollapsed && <span className="label">Proyectos en proceso</span>}
          </li>
          <li
            className="menu-item active"
            onClick={() =>
              navigate(`/proyectoscompletados/${depId}`, { state: { nombre: departamentoNombre } })
            }
          >
            <FaProjectDiagram className="icon" />
            {!sidebarCollapsed && <span className="label">Proyectos finalizados</span>}
          </li>
          <li className="menu-item" onClick={() => navigate("/login")}>
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
            <span className="titulo-barra-global">
              PROYECTOS FINALIZADOS DE {departamentoNombre.toUpperCase()}
            </span>
          </div>
        </div>

        {/* 🟢 Controles de Ordenamiento */}
        {proyectos.length > 0 && (
          <div className="sort-controls-container">
            <span className="sort-label">Ordenar por:</span>
            <div className="dropdown-sort-menu">
              <button
                className="sort-main-button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {getSortButtonText()}
                <FaCaretDown className={`dropdown-arrow ${isMenuOpen ? "open" : ""}`} />
              </button>

              {isMenuOpen && (
                <div className="dropdown-options">
                  {/* Fecha Fin */}
                  <div
                    className={`dropdown-item ${
                      sortBy === "fechaFin" && sortDirection === "desc" ? "active" : ""
                    }`}
                    onClick={() => handleSelectSort("fechaFin", "desc")}
                  >
                    Fecha Finalización - Descendente
                  </div>
                  <div
                    className={`dropdown-item ${
                      sortBy === "fechaFin" && sortDirection === "asc" ? "active" : ""
                    }`}
                    onClick={() => handleSelectSort("fechaFin", "asc")}
                  >
                    Fecha Finalización - Ascendente
                  </div>

                  <hr className="dropdown-divider" />

                  {/* Fecha Inicio */}
                  <div
                    className={`dropdown-item ${
                      sortBy === "fechaInicio" && sortDirection === "desc" ? "active" : ""
                    }`}
                    onClick={() => handleSelectSort("fechaInicio", "desc")}
                  >
                    Fecha Inicio - Descendente
                  </div>
                  <div
                    className={`dropdown-item ${
                      sortBy === "fechaInicio" && sortDirection === "asc" ? "active" : ""
                    }`}
                    onClick={() => handleSelectSort("fechaInicio", "asc")}
                  >
                    Fecha Inicio - Ascendente
                  </div>

                  <hr className="dropdown-divider" />

                  {/* Nombre */}
                  <div
                    className={`dropdown-item ${
                      sortBy === "nombre" && sortDirection === "asc" ? "active" : ""
                    }`}
                    onClick={() => handleSelectSort("nombre", "asc")}
                  >
                    Nombre (A → Z) - Ascendente
                  </div>
                  <div
                    className={`dropdown-item ${
                      sortBy === "nombre" && sortDirection === "desc" ? "active" : ""
                    }`}
                    onClick={() => handleSelectSort("nombre", "desc")}
                  >
                    Nombre (Z → A) - Descendente
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lista de proyectos */}
        <div className="proyectos-linea">
          {proyectosOrdenados.length === 0 ? (
            <p className="proyecto-sin-tareas">
              No hay proyectos finalizados en este departamento.
            </p>
          ) : (
            proyectosOrdenados.map((proyecto) => (
              <div key={proyecto.id_proyecto} className="proyecto-linea-item completado">
                <div className="proyecto-nombre">
                  <span className="proyecto-label">Nombre: </span>
                  <span className="proyecto-valor">{proyecto.p_nombre}</span>
                </div>

                <div className="proyecto-columnas">
                  <div className="proyecto-linea-columna">
                    <span className="proyecto-label">Fecha inicio:</span>
                    <span className="proyecto-valor">{proyecto.pf_inicio}</span>
                  </div>
                  <div className="proyecto-linea-columna">
                    <span className="proyecto-label">Fecha fin:</span>
                    <span className="proyecto-valor">{proyecto.pf_fin}</span>
                  </div>
                  <div className="proyecto-linea-columna">
                    <span className="proyecto-label">Estatus:</span>
                    <span className="proyecto-valor">{proyecto.p_estatus}</span>
                  </div>
                  <div className="proyecto-linea-columna">
                    <span className="proyecto-label">Responsable:</span>
                    <span className="proyecto-valor">{proyecto.responsable}</span>
                  </div>
                </div>

                <div className="proyecto-linea-progreso-container">
                  <div
                    className="proyecto-linea-progreso"
                    onClick={() =>
                      navigate(`/proyecto/${proyecto.id_proyecto}`, {
                        state: {
                          nombreProyecto: proyecto.p_nombre,
                          descripcionProyecto: proyecto.descripcion,
                        },
                      })
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <ProgresoProyecto
                      progresoInicial={proyecto.porcentaje}
                      tareasTotales={proyecto.total_tareas}
                      tareasCompletadas={proyecto.tareas_completadas}
                      descripcion={proyecto.descripcion}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
