import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FaCaretDown } from "react-icons/fa"; 
import "../css/DepProSuperUsuario.css";
import "../css/global.css";
import logo3 from "../imagenes/logo3.png";
import ProgresoProyecto from "./ProgresoProyecto";
import Layout from "../components/Layout"; 
import MenuDinamico from "../components/MenuDinamico";
import { slugify } from "./utils/slugify"; 
import { useProyectosOrdenados } from '../hooks/useProyectosOrdenados'; 

export default function DepProProceso() {
  // ----------------------------------------------------
  // Lógica de URL y Persistencia (MANTENER)
  // ----------------------------------------------------
  const { depNombreSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const stateDepId = location.state?.depId;
  const savedDepId = localStorage.getItem('last_depId');
  const depId = stateDepId || savedDepId;
  const departamentoNombre = location.state?.nombre || 
                             (depNombreSlug ? depNombreSlug.replace(/-/g, ' ') : "Departamento");
  const currentDepartamentoSlug = slugify(departamentoNombre);

  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  // ----------------------------------------------------
  // USAR EL CUSTOM HOOK PARA ORDENAMIENTO
  // ----------------------------------------------------
  const {
    proyectosOrdenados,
    sortBy,
    sortDirection,
    isMenuOpen,
    setIsMenuOpen,
    handleSelectSort,
    getSortButtonText,
  } = useProyectosOrdenados(proyectos); 
  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    if (!depId) {
      console.error("ID de departamento no disponible. Redirigiendo.");
      setLoading(false);
      navigate("/Principal", { replace: true }); 
      return;
    }
    
    if (stateDepId) {
        localStorage.setItem('last_depId', stateDepId);
    } else if (depId) {
        localStorage.setItem('last_depId', depId);
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

    if (depId) {
        fetchDatos();
    }
    
  }, [depId, navigate, stateDepId, savedDepId]); 


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
      // 1. ENVOLVER todo con el componente Layout
    <Layout 
      // 2. Pasar el título al Encabezado del Layout
      titulo={`PROYECTOS EN PROCESO DE ${departamentoNombre}`}
      // 3. Pasar el MenuDinamico y sus propiedades para la navegación
      sidebar={
        <MenuDinamico 
          departamentoId={depId}
          departamentoNombre={departamentoNombre}
          departamentoSlug={currentDepartamentoSlug}
          activeRoute="proceso"
        />
      }
    >
        {/* CONTROLES DE ORDENAMIENTO (Usando el hook) */}
        {proyectos.length > 0 && (
            <div className="sort-controls-container">
                <span className="sort-label">Ordenar por:</span>
                <div className="dropdown-sort-menu">
                    <button 
                        className="sort-main-button"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {getSortButtonText()}
                        <FaCaretDown className={`dropdown-arrow ${isMenuOpen ? 'open' : ''}`} />
                    </button>
                    
                    {isMenuOpen && (
                        <div className="dropdown-options">
                            {/* Opciones de ordenamiento: Usando valores del hook */}
                            <div className={`dropdown-item ${sortBy === 'nombre' && sortDirection === 'asc' ? 'active' : ''}`} onClick={() => handleSelectSort('nombre', 'asc')}> Nombre (A → Z) - Ascendente </div>
                            <div className={`dropdown-item ${sortBy === 'nombre' && sortDirection === 'desc' ? 'active' : ''}`} onClick={() => handleSelectSort('nombre', 'desc')}> Nombre (Z → A) - Descendente </div>
                            <hr className="dropdown-divider"/>
                            <div className={`dropdown-item ${sortBy === 'fechaInicio' && sortDirection === 'desc' ? 'active' : ''}`} onClick={() => handleSelectSort('fechaInicio', 'desc')}> Fecha Inicio - Descendente </div>
                            <div className={`dropdown-item ${sortBy === 'fechaInicio' && sortDirection === 'asc' ? 'active' : ''}`} onClick={() => handleSelectSort('fechaInicio', 'asc')}> Fecha Inicio - Ascendente </div>
                            <hr className="dropdown-divider"/>
                            <div className={`dropdown-item ${sortBy === 'fechaFin' && sortDirection === 'desc' ? 'active' : ''}`} onClick={() => handleSelectSort('fechaFin', 'desc')}> Fecha Fin - Descendente </div>
                            <div className={`dropdown-item ${sortBy === 'fechaFin' && sortDirection === 'asc' ? 'active' : ''}`} onClick={() => handleSelectSort('fechaFin', 'asc')}> Fecha Fin - Ascendente </div>
                        </div>
                    )}
                </div>

            </div>
        )}

        {/* LISTA DE PROYECTOS (Usando proyectosOrdenados del hook) */}
        <div className="proyectos-linea">
          {proyectosOrdenados.length === 0 ? ( 
            <p className="proyecto-sin-tareas">
              No hay proyectos en proceso con tareas pendientes o sin tareas asignadas.
            </p>
          ) : (
            proyectosOrdenados.map((proyecto) => ( 
              <div key={proyecto.id_proyecto} className="proyecto-linea-item">
                {/* ... (Contenido del proyecto, sin cambios) ... */}
                <div className="proyecto-nombre">
                  <span className="proyecto-label">Proyecto: </span>
                  <span className="proyecto-valor">{proyecto.p_nombre}</span>
                </div>
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
    </Layout>
  );
}
