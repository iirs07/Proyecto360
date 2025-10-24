import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaTasks, FaProjectDiagram, FaUsers } from "react-icons/fa";
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

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

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

        const proyectosEnProceso = data
          .filter(
            (p) =>
              p.p_estatus === "En proceso" &&
              (p.total_tareas === 0 || p.tareas_completadas < p.total_tareas)
          )
          .sort((a, b) => new Date(a.pf_inicio) - new Date(b.pf_inicio));

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

        <div className="proyectos-linea">
          {proyectos.length === 0 ? (
            <p className="proyecto-sin-tareas">
              No hay proyectos en proceso con tareas pendientes o sin tareas asignadas.
            </p>
          ) : (
            proyectos.map((proyecto) => (
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
