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

    // ESTADOS PARA EL MODAL/CARRUSEL
    const [modalOpen, setModalOpen] = useState(false);
    const [imagenActual, setImagenActual] = useState("");
    const [evidenciasUrls, setEvidenciasUrls] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Funciones para abrir y cerrar modal
    const abrirModal = (urls, index) => {
        if (urls.length === 0) return;

        setEvidenciasUrls(urls);
        setCurrentIndex(index);
        setImagenActual(urls[index]);
        setModalOpen(true);
    };

    const cerrarModal = () => {
        setModalOpen(false);
        setImagenActual("");
        setEvidenciasUrls([]);
        setCurrentIndex(0);
    };

    // FUNCIONES DE NAVEGACIÓN DEL CARRUSEL
    const goToPrevious = () => {
        setCurrentIndex(prevIndex => 
            prevIndex === 0 ? evidenciasUrls.length - 1 : prevIndex - 1
        );
    };

    const goToNext = () => {
        setCurrentIndex(prevIndex => 
            prevIndex === evidenciasUrls.length - 1 ? 0 : prevIndex + 1
        );
    };

    const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);
    const toggleExpand = (id) => setExpandedTask(expandedTask === id ? null : id);

    // useEffect para actualizar la imagen cuando cambia el índice
    useEffect(() => {
        if (evidenciasUrls.length > 0 && modalOpen) {
            setImagenActual(evidenciasUrls[currentIndex]);
        }
    }, [currentIndex, evidenciasUrls, modalOpen]);


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

                            // Extraemos las URLs de las evidencias de esta tarea para el carrusel
                            const currentEvidenciaUrls = tarea.evidencias ? tarea.evidencias.map(e => e.url) : [];

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
                                        
                                        {/* ✅ NUEVA ESTRUCTURA DE DETALLES: Descripción primero (Ancho completo) */}
                                        <div className="detalle-columna detalle-descripcion">
                                            <span className="detalle-label">Descripción:</span>
                                            <span className="detalle-valor">{tarea.descripcion || "Sin descripción"}</span>
                                        </div>
                                        
                                        {/* ✅ NUEVO: Grid para los campos cortos y evidencia */}
                                        <div className="tarea-datos-grid">
                                            {/* Inicio */}
                                            <div className="detalle-columna">
                                                <span className="detalle-label">Inicio:</span>
                                                <span className="detalle-valor">{tarea.tf_inicio || "No definido"}</span>
                                            </div>
                                            {/* Fin */}
                                            <div className="detalle-columna">
                                                <span className="detalle-label">Fin:</span>
                                                <span className="detalle-valor">{tarea.tf_fin || "No definido"}</span>
                                            </div>
                                            {/* Responsable */}
                                            <div className="detalle-columna">
                                                <span className="detalle-label">Responsable:</span>
                                                <span className="detalle-valor">{tarea.responsable || "No definido"}</span>
                                            </div>

                                            {/* Evidencia (Se alinea en el grid, ocupando una columna o más) */}
                                            {tarea.evidencias && tarea.evidencias.length > 0 && (
                                                <div className="detalle-columna detalle-evidencia-seccion">
                                                    <div className="detalle-Evidencia-container">
                                                        <span className="detalle-label">Evidencia:</span>
                                                        <div className="evidencias-container">
                                                            
                                                            <div className="detalle-Evidencia-galeria">
                                                                <img
                                                                    src={folderIcon}
                                                                    alt={`Abrir ${tarea.evidencias.length} evidencias`}
                                                                    className="evidencia-icono"
                                                                    onClick={() => abrirModal(currentEvidenciaUrls, 0)}
                                                                />
                                                            </div>

                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div> {/* Fin tarea-datos-grid */}

                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* MODAL CON CARRUSEL */}
                {modalOpen && (
                    <div className="modal-overlay" onClick={cerrarModal}>
                        <div className="modal-content-carrusel" onClick={(e) => e.stopPropagation()}>
                            {/* Botón Anterior (solo si hay más de 1 imagen) */}
                            {evidenciasUrls.length > 1 && (
                                <button className="modal-nav-btn prev" onClick={goToPrevious}>
                                    &#10094;
                                </button>
                            )}

                            <div className="carrusel-slide">
                                <img src={imagenActual} alt={`Evidencia ${currentIndex + 1}`} className="modal-img" />
                                
                                {/* Contador de índice (solo si hay más de 1 imagen) */}
                                {evidenciasUrls.length > 1 && (
                                    <div className="carrusel-index">
                                        {currentIndex + 1} / {evidenciasUrls.length}
                                    </div>
                                )}
                            </div>

                            {/* Botón Siguiente (solo si hay más de 1 imagen) */}
                            {evidenciasUrls.length > 1 && (
                                <button className="modal-nav-btn next" onClick={goToNext}>
                                    &#10095;
                                </button>
                            )}

                            <button className="modal-close" onClick={cerrarModal}>X</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}