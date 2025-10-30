import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaTasks, FaProjectDiagram, FaUsers, FaCaretDown } from "react-icons/fa"; // Importar FaCaretDown
import "../css/DepProSuperUsuario.css";
import "../css/global.css";
import logo3 from "../imagenes/logo3.png";
import ProgresoProyecto from "./ProgresoProyecto";

export default function DepProSuperUsuario() {
  const { depId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const departamentoNombre = location.state?.nombre || "Departamento";

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🟢 ESTADOS AÑADIDOS PARA ORDENAMIENTO
  const [sortBy, setSortBy] = useState("fechaInicio"); // 'fechaInicio', 'fechaFin', o 'nombre'
  const [sortDirection, setSortDirection] = useState("asc"); // 'asc' o 'desc'
  // 🟢 NUEVO ESTADO PARA EL MENÚ DESPLEGABLE
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);
  
  // 🟢 FUNCIÓN DE ORDENAMIENTO UNIFICADA PARA EL MENÚ
  const handleSelectSort = (newSortBy, newSortDirection) => {
    setSortBy(newSortBy);
    setSortDirection(newSortDirection);
    setIsMenuOpen(false); // Cierra el menú después de seleccionar
  };


  // 🟢 FUNCIÓN PARA OBTENER EL TEXTO Y EL ICONO DEL BOTÓN PRINCIPAL
  const getSortButtonText = () => {
    const criterioMap = {
      fechaInicio: "Fecha Inicio",
      fechaFin: "Fecha Fin",
      nombre: "Nombre",
    };
    // ▲ = ascendente, ▼ = descendente
    const icon = sortDirection === 'asc' ? ' ▲ (Asc.)' : ' ▼ (Desc.)'; 
    
    return `${criterioMap[sortBy] || 'Fecha Inicio'} ${icon}`;
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

        // Se mantiene el filtro para proyectos en proceso
        const proyectosEnProceso = data
          .filter(
            (p) =>
              p.p_estatus === "En proceso" &&
              (p.total_tareas === 0 || p.tareas_completadas < p.total_tareas)
          );

        setProyectos(proyectosEnProceso);
      } catch (err) {
        console.error("Error al cargar proyectos:", err);
        setProyectos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDatos();
  }, [depId, navigate]);

  // 🟢 LÓGICA DE ORDENAMIENTO DINÁMICO (Se mantiene igual)
  const proyectosOrdenados = [...proyectos].sort((a, b) => {
    let comparison = 0;
    const direction = sortDirection === "asc" ? 1 : -1;

    if (sortBy === "fechaInicio") {
      // Ordenar por fecha de inicio (pf_inicio)
      const dateA = new Date(a.pf_inicio);
      const dateB = new Date(b.pf_inicio);
      comparison = dateA - dateB;
    } else if (sortBy === "fechaFin") {
      // Ordenar por fecha de fin (pf_fin)
      const dateA = new Date(a.pf_fin);
      const dateB = new Date(b.pf_fin);
      comparison = dateA - dateB;
    } else if (sortBy === "nombre") {
      // Ordenar por nombre (p_nombre) alfabéticamente
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
        <div className="loader-texto">CARGANDO PROYECTOS EN PROCESO...</div>
        <div className="loader-spinner"></div>
      </div>
    );
  }

  return (
    <div className="main-layout">
      {/* Sidebar (Contenido Omitido para brevedad, se mantiene igual) */}
      <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <ul>
          <li className="menu-item active" onClick={() => navigate("/Principal")}>
            <FaHome className="icon" />
            {!sidebarCollapsed && <span className="label">Inicio</span>}
          </li>
          <li
            className="menu-item active"
            onClick={() =>
              navigate(`/DepProSuperUsuario/${depId}`, { state: { nombre: departamentoNombre } })
            }
          >
            <FaTasks className="icon" />
            {!sidebarCollapsed && <span className="label">Proyectos en proceso</span>}
          </li>
          <li
            className="menu-item"
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
              PROYECTOS EN PROCESO DE {departamentoNombre.toUpperCase()}
            </span>
          </div>
        </div>

        {/* 🟢 CONTROLES DE ORDENAMIENTO: MENÚ DESPLEGABLE PURO */}
        {proyectos.length > 0 && (
            <div className="sort-controls-container">
                <span className="sort-label">Ordenar por:</span>
                
                {/* Menú Desplegable */}
                <div className="dropdown-sort-menu">
                    {/* Botón Principal: Muestra el estado actual y abre/cierra el menú */}
                    <button 
                        className="sort-main-button"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {getSortButtonText()}
                        <FaCaretDown className={`dropdown-arrow ${isMenuOpen ? 'open' : ''}`} />
                    </button>
                    
                    {/* Contenido del Menú Desplegable (Solo visible si isMenuOpen es true) */}
                    {isMenuOpen && (
                        <div className="dropdown-options">
                            {/* Opción: Nombre Ascendente */}
                            <div 
                                className={`dropdown-item ${sortBy === 'nombre' && sortDirection === 'asc' ? 'active' : ''}`}
                                onClick={() => handleSelectSort('nombre', 'asc')}
                            >
                                Nombre (A → Z) - Ascendente
                            </div>

                            {/* Opción: Nombre Descendente */}
                            <div 
                                className={`dropdown-item ${sortBy === 'nombre' && sortDirection === 'desc' ? 'active' : ''}`}
                                onClick={() => handleSelectSort('nombre', 'desc')}
                            >
                                Nombre (Z → A) - Descendente
                            </div>
                            
                            <hr className="dropdown-divider"/>

                            {/* Opción: Fecha Inicio Descendente (Más reciente) */}
                            <div 
                                className={`dropdown-item ${sortBy === 'fechaInicio' && sortDirection === 'desc' ? 'active' : ''}`}
                                onClick={() => handleSelectSort('fechaInicio', 'desc')}
                            >
                                Fecha Inicio - Descendente
                            </div>

                            {/* Opción: Fecha Inicio Ascendente (Más antiguo) */}
                            <div 
                                className={`dropdown-item ${sortBy === 'fechaInicio' && sortDirection === 'asc' ? 'active' : ''}`}
                                onClick={() => handleSelectSort('fechaInicio', 'asc')}
                            >
                                Fecha Inicio - Ascendente
                            </div>

                            <hr className="dropdown-divider"/>
                            
                            {/* Opción: Fecha Fin Descendente (Más reciente) */}
                            <div 
                                className={`dropdown-item ${sortBy === 'fechaFin' && sortDirection === 'desc' ? 'active' : ''}`}
                                onClick={() => handleSelectSort('fechaFin', 'desc')}
                            >
                                Fecha Fin - Descendente
                            </div>

                            {/* Opción: Fecha Fin Ascendente (Más antiguo) */}
                            <div 
                                className={`dropdown-item ${sortBy === 'fechaFin' && sortDirection === 'asc' ? 'active' : ''}`}
                                onClick={() => handleSelectSort('fechaFin', 'asc')}
                            >
                                Fecha Fin - Ascendente
                            </div>
                        </div>
                    )}
                </div>

            </div>
        )}

        <div className="proyectos-linea">
          {proyectosOrdenados.length === 0 ? ( 
            <p className="proyecto-sin-tareas">
              No hay proyectos en proceso con tareas pendientes o sin tareas asignadas.
            </p>
          ) : (
            proyectosOrdenados.map((proyecto) => ( 
              <div key={proyecto.id_proyecto} className="proyecto-linea-item">
                {/* Nombre del proyecto */}
                <div className="proyecto-nombre">
                  <span className="proyecto-label">Proyecto</span>
                  <span className="proyecto-valor">{proyecto.p_nombre}</span>
                </div>

                {/* Datos en columnas */}
                <div className="proyecto-columnas">
                  <div className="proyecto-linea-columna">
                    <span className="proyecto-label">Inicio:</span>
                    <span className="proyecto-valor">{proyecto.pf_inicio}</span>
                  </div>
                  <div className="proyecto-linea-columna">
                    <span className="proyecto-label">Fin:</span>
                    <span className="proyecto-valor">{proyecto.pf_fin}</span>
                  </div>
                  <div className="proyecto-linea-columna">
                    <span className="proyecto-label">Estado:</span>
                    <span className="proyecto-valor">{proyecto.p_estatus}</span>
                  </div>
                  <div className="proyecto-linea-columna">
                    <span className="proyecto-label">Encargado:</span>
                    <span className="proyecto-valor">{proyecto.responsable}</span>
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="proyecto-linea-progreso-container">
                  {proyecto.total_tareas > 0 ? (
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
                  ) : (
                    <span className="proyecto-sin-tareas">Sin tareas asignadas</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
