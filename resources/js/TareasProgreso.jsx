import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaUsers } from "react-icons/fa"; 
import "../css/TareasProgreso.css";
import "../css/global.css";
import logo3 from "../imagenes/logo3.png";
import folderIcon from "../imagenes/folder.png";

export default function TareasProgreso() {
  const { idProyecto } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const nombreProyecto = location.state?.nombreProyecto || "Proyecto";
  const descripcionProyecto = location.state?.descripcionProyecto || "Sin descripción";

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTask, setExpandedTask] = useState(null);

 // Arriba del componente, dentro de TareasProgreso:
const [modalOpen, setModalOpen] = useState(false);
const [imagenActual, setImagenActual] = useState("");

// Funciones para abrir y cerrar modal
const abrirModal = (url) => {
  setImagenActual(url);
  setModalOpen(true);
};

const cerrarModal = () => {
  setModalOpen(false);
  setImagenActual("");
};

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);
  const toggleExpand = (id) => setExpandedTask(expandedTask === id ? null : id);

  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchTareas = async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/api/proyectos/${idProyecto}/tareas`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        let data = await res.json();

        // Ordenar por fecha de inicio
        data.sort((a, b) => {
          const fechaA = a.tf_inicio ? new Date(a.tf_inicio) : new Date(0);
          const fechaB = b.tf_inicio ? new Date(b.tf_inicio) : new Date(0);
          return fechaA - fechaB;
        });

        setTareas(data);
      } catch (err) {
        console.error("Error al cargar tareas:", err);
        alert("Error al cargar tareas: " + err.message);
        setTareas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTareas();
  }, [idProyecto, navigate]);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader-logo">
          <img src={logo3} alt="Cargando" />
        </div>
        <div className="loader-texto">CARGANDO TAREAS...</div>
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
              TAREAS DEL PROYECTO {nombreProyecto.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="proyecto-descripcion-contenedor">
          <strong>Descripción del proyecto:</strong>
          <p>{descripcionProyecto}</p>
        </div>

        {/* Lista de tareas */}
        <div className="tareas-acordeon">
          {tareas.length === 0 ? (
            <p>No hay tareas asignadas.</p>
          ) : (
            tareas.map((tarea, index) => {
              const isExpanded = expandedTask === tarea.id_tarea;
              const estatusClass = tarea.t_estatus.toLowerCase().replace(" ", "-");

              return (
                <div key={tarea.id_tarea} className={`tarea-item ${estatusClass}`}>
                  <div className="tarea-titulo" onClick={() => toggleExpand(tarea.id_tarea)}>
                    <span>{index + 1}. {tarea.t_nombre}</span>
                    <div className="tarea-titulo-derecha">
                      <span className={`tarea-estatus ${estatusClass}`}>{tarea.t_estatus}</span>
                      <span className={`flecha ${isExpanded ? "abierta" : ""}`}>&#9654;</span>
                    </div>
                  </div>

                  <div className={`tarea-detalle ${isExpanded ? "abierta" : ""}`}>
                    <div className="detalle-columna">
                      <span className="detalle-label">Descripción:</span>
                      <span className="detalle-valor">{tarea.descripcion || "Sin descripción"}</span>
                    </div>
                    <div className="detalle-columna">
                      <span className="detalle-label">Inicio:</span>
                      <span className="detalle-valor">{tarea.tf_inicio || "No definido"}</span>
                    </div>
                    <div className="detalle-columna">
                      <span className="detalle-label">Fin:</span>
                      <span className="detalle-valor">{tarea.tf_fin || "No definido"}</span>
                    </div>
                    <div className="detalle-columna">
                      <span className="detalle-label">Responsable:</span>
                      <span className="detalle-valor">{tarea.responsable || "No definido"}</span>
                    </div>

                    {tarea.evidencias && tarea.evidencias.length > 0 && (
                      <div className="detalle-columna">
                        <div className="detalle-Evidencia-container">
                          <span className="detalle-label">Evidencia:</span>
                          <div className="evidencias-container">
                            {tarea.evidencias.map(ev => (
                              <div key={ev.id_evidencia} className="detalle-Evidencia">
                                <img
                                  src={folderIcon}
                                  alt="Abrir evidencia"
                                  className="evidencia-icono"
                                  onClick={() => abrirModal(ev.url)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}


                  </div>
                </div>
              );
            })
          )}
        </div>
{/* Modal */}
{modalOpen && (
  <div className="modal-overlay" onClick={cerrarModal}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <img src={imagenActual} alt="Evidencia" className="modal-img" />
      <button className="modal-close" onClick={cerrarModal}>X</button>
    </div>
  </div>
)}
      </div>
    </div>
  );
}
