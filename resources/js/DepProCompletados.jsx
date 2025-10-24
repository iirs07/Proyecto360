import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaTasks, FaProjectDiagram, FaUsers } from "react-icons/fa";
import "../css/DepProSuperUsuario.css";
import "../css/global.css";
import logo3 from "../imagenes/logo3.png";
import ProgresoProyecto from "./ProgresoProyecto";

export default function DepProCompletados() {
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

        const proyectosFinalizados = data
          .filter((p) => p.p_estatus === "Finalizado" && p.total_tareas > 0)
          .sort((a, b) => new Date(b.pf_fin) - new Date(a.pf_fin));

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
        {/* Logo de fondo */}
        <div className="logo-fondo">
          <img src={logo3} alt="Fondo" />
        </div>

        {/* Header */}
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

        {/* Lista de proyectos */}
        <div className="proyectos-linea">
          {proyectos.length === 0 ? (
            <p className="proyecto-sin-tareas">
              No hay proyectos finalizados en este departamento.
            </p>
          ) : (
            proyectos.map((proyecto) => (
              <div key={proyecto.id_proyecto} className="proyecto-linea-item completado">
                {/* Fila 1: Nombre */}
                <div className="proyecto-nombre">
                  <span className="proyecto-label">Nombre</span>
                  <span className="proyecto-valor">{proyecto.p_nombre}</span>
                </div>

                {/* Fila 2: Datos horizontales */}
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

                {/* Fila 3: Progreso */}
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
