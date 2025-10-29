import React, { useState, useEffect } from "react";
import { FaHome, FaFileAlt, FaUsers, FaTimesCircle } from "react-icons/fa"; 
import { useNavigate } from "react-router-dom";
import "../css/global.css";
import "../css/ReporteSuperUsuario.css";
import logo3 from "../imagenes/logo3.png";
import PdfViewer from "./PdfViewer"; 

export default function ReporteSuperUsuario() {
    // ⬅️ ESTADOS AÑADIDOS PARA EL VISOR DE PDF
    const [pdfUrl, setPdfUrl] = useState(null);
    const [showPdfViewer, setShowPdfViewer] = useState(false);
    // ⬆️ FIN DE ESTADOS AÑADIDOS

    const [areas, setAreas] = useState([]);
    const [seleccionados, setSeleccionados] = useState([]);
    const [areasAbiertas, setAreasAbiertas] = useState({});
    const [tipoProyecto, setTipoProyecto] = useState("Ambos");
    const [periodo, setPeriodo] = useState("Rango");
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [anio, setAnio] = useState("");
    const [mes, setMes] = useState("");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    
    // 🟢 ESTADO PARA LA BARRA DE PROGRESO
    const [generationProgress, setGenerationProgress] = useState(0); 

    const navigate = useNavigate();

    const listaMeses = [
        { value: "01", label: "Enero" },
        { value: "02", label: "Febrero" },
        { value: "03", label: "Marzo" },
        { value: "04", label: "Abril" },
        { value: "05", label: "Mayo" },
        { value: "06", label: "Junio" },
        { value: "07", label: "Julio" },
        { value: "08", label: "Agosto" },
        { value: "09", label: "Septiembre" },
        { value: "10", label: "Octubre" },
        { value: "11", label: "Noviembre" },
        { value: "12", label: "Diciembre" },
    ];

    const listaAnios = [];
    const anioActual = new Date().getFullYear();
    for (let i = anioActual - 5; i <= anioActual + 1; i++) listaAnios.push(i);

    // === CARGA DE DATOS ===
    useEffect(() => {
        const fetchAreas = async () => {
            try {
                const response = await fetch("http://127.0.0.1:8000/api/departamentos");
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                const data = await response.json();

                const areasAdaptadas = data.map(area => ({
                    id: area.id,
                    nombre: area.nombre,
                    departamentos: area.departamentos
                        ? area.departamentos.map(dep => ({
                            id_departamento: dep.id_departamento,
                            d_nombre: dep.d_nombre,
                        }))
                        : [],
                }));

                setAreas(areasAdaptadas);
            } catch (error) {
                console.error("Error al obtener las áreas:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAreas();
    }, []);

    // === FUNCIONES DE MANEJO DE ESTADOS ===
    const toggleDepartamento = (depId) => {
        setSeleccionados((prev) =>
            prev.includes(depId)
                ? prev.filter((d) => d !== depId)
                : [...prev, depId]
        );
    };

    const toggleArea = (area) => {
        const depIds = area.departamentos.map((dep) => dep.id_departamento);
        const allSelected = depIds.every((id) => seleccionados.includes(id));

        if (allSelected) {
            setSeleccionados((prev) => prev.filter((id) => !depIds.includes(id)));
        } else {
            setSeleccionados((prev) => [...new Set([...prev, ...depIds])]);
        }
    };

    const toggleAbrirArea = (areaId) => {
        setAreasAbiertas((prev) => ({ ...prev, [areaId]: !prev[areaId] }));
    };

    const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

    // 🟢 FUNCIÓN para simular el progreso (AJUSTADA AL 99%)
    const simulateProgress = () => {
        setGenerationProgress(0); // Reiniciar al inicio
        // Simular progreso cada 150ms
        const interval = setInterval(() => {
            setGenerationProgress(prev => {
                // Si ya estamos cerca del 99%, paramos aquí.
                if (prev >= 95) { 
                    clearInterval(interval);
                    return 99; // 🟢 Aseguramos que se quede en 99%
                }
                // Incremento más dinámico para llegar al 99%
                const increment = Math.floor(Math.random() * 8) + 3; // Incremento aleatorio entre 3 y 10
                const nextProgress = prev + increment;
                return nextProgress < 99 ? nextProgress : 99;
            });
        }, 150);
        return interval;
    };
    
    // 🟢 FUNCIÓN para cancelar la generación 
    const handleCancelGeneration = () => {
        setIsGenerating(false);
        setGenerationProgress(0);
        console.log("Generación de reporte cancelada por el usuario.");
    };


    // ⬇️ FUNCIÓN handleGenerarReporte (con limpieza del mes) ⬇️
const handleGenerarReporte = async () => {
    if (seleccionados.length === 0) {
        alert("⚠️ Error: Selecciona al menos un departamento para generar el reporte.");
        return;
    }

    let urlFiltros = `?tipoProyecto=${tipoProyecto}&departamentos=${seleccionados.join(",")}`;
    let alertaPeriodo = "";

    if (periodo === "Año" && anio) {
        urlFiltros += `&anio=${anio}`;
    } else if (periodo === "Mes" && anio && mes) {
        // 🟢 CORRECCIÓN: 'mes' ahora es solo el número del mes (ej: "01"), 
        // ya no se requiere split() como en la versión anterior.
        urlFiltros += `&anio=${anio}&mes=${mes}`; 
    } else if (periodo === "Rango" && fechaInicio && fechaFin) {
        urlFiltros += `&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
    } else if (periodo === "Año" && !anio) {
        alertaPeriodo = 'Año';
    } else if (periodo === "Mes" && (!anio || !mes)) {
        alertaPeriodo = 'Mes/Año';
    } else if (periodo === "Rango" && (!fechaInicio || !fechaFin)) {
        alertaPeriodo = 'Rango de fechas';
    }

    if (alertaPeriodo) {
        alert(`⚠️ Error: Debes seleccionar un valor para el periodo de tipo "${alertaPeriodo}".`);
        return;
    }

    const API_URL = `http://127.0.0.1:8000/api/reporte${urlFiltros}`;
    console.log("Solicitando Reporte a:", API_URL);

    let progressInterval = null; 

    try {
        setIsGenerating(true); 
        progressInterval = simulateProgress(); 

        const response = await fetch(API_URL);
        
        clearInterval(progressInterval); 

        if (!response.ok) {
            throw new Error(`Error al generar reporte (${response.status})`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setPdfUrl(url);
        
        // Finaliza al 100% y abre el visor
        setGenerationProgress(100); 
        setTimeout(() => {
            setShowPdfViewer(true);
            setGenerationProgress(0); 
        }, 500); 

    } catch (error) {
        clearInterval(progressInterval); 
        console.error("Error al generar el reporte:", error);
        alert(`❌ Ocurrió un error al generar el reporte: ${error.message}`);
        setGenerationProgress(0); 
    } finally {
        // La barra se oculta un poco después de que se abre el PDF (gracias al setTimeout)
        // Pero es seguro dejarlo aquí para el caso de error
        if (!showPdfViewer) {
            setIsGenerating(false); 
        }
    }
};


    // ⬅️ FUNCIÓN PARA CERRAR EL VISOR Y LIBERAR MEMORIA
    const handleClosePdfViewer = () => {
        if (pdfUrl) {
            window.URL.revokeObjectURL(pdfUrl);
            setPdfUrl(null);
        }
        setShowPdfViewer(false);
    };

    // === PANTALLA DE CARGA ===
    if (isLoading) {
        return (
            <div className="loader-container">
                <div className="loader-logo">
                    <img src={logo3} alt="Cargando" />
                </div>
                <div className="loader-texto">CARGANDO...</div>
                <div className="loader-spinner"></div>
            </div>
        );
    }
    // === CONTENIDO PRINCIPAL ===
    return (
        <div className="main-layout">
            {/* Sidebar */}
            <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
                <ul>
                    <li className="menu-item" onClick={() => navigate("/Principal")}>
                        <FaHome className="icon" />
                        {!sidebarCollapsed && <span className="label">Inicio</span>}
                    </li>
                    <li className="menu-item active" onClick={() => navigate("/ReporteSuperUsuario")}>
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
                        <span className="titulo-barra-global">
                            GENERAR REPORTES DE PROYECTOS EN LOS ÁREAS / DEPARTAMENTOS
                        </span>
                    </div>
                </div>

                <div className="reporte-container">
                    <div className="main-form-container">
                        {/* ⬅️ INICIO DE LÍNEAS DE CÓDIGO FALTANTES (Filtros) ⬅️ */}
                        <div className="filtros-grid">
                            {/* === 1. Áreas === */}
                            <div className="form-section area-selection-panel">
                                <label className="titulo-seccion"><strong>1. Seleccionar Áreas / Departamentos</strong></label>
                                <div className="areas-list-scroll">
                                    {areas.map((area) => (
                                        <div key={area.id} className="area-item-contenedor">
                                            <div className="area-header">
                                                <input
                                                    type="checkbox"
                                                    checked={area.departamentos.every((dep) =>
                                                        seleccionados.includes(dep.id_departamento)
                                                    )}
                                                    onChange={() => toggleArea(area)}
                                                />
                                                <span
                                                    className="area-nombre"
                                                    onClick={() => toggleAbrirArea(area.id)}
                                                >
                                                    {area.nombre}
                                                </span>
                                                <span
                                                    className="flecha-area"
                                                    onClick={() => toggleAbrirArea(area.id)}
                                                >
                                                    {areasAbiertas[area.id] ? "▼" : "▶"}
                                                </span>
                                            </div>

                                            {areasAbiertas[area.id] && (
                                                <div className="area-departamentos-submenu">
                                                    {area.departamentos.map((dep) => (
                                                        <label key={dep.id_departamento} className="departamento-label">
                                                            <input
                                                                type="checkbox"
                                                                checked={seleccionados.includes(dep.id_departamento)}
                                                                onChange={() => toggleDepartamento(dep.id_departamento)}
                                                            />
                                                            <span className="departamento-texto">{dep.d_nombre}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* === 2. Período === */}
                            <div className="form-section periodo-section">
                                <label className="titulo-seccion"><strong>2. Seleccionar Periodo</strong></label>
                                <div className="periodo-tipo-tabs">
                                    {["Año", "Mes", "Rango"].map((t) => (
                                        <button
                                            key={t}
                                            className={`periodo-tab ${periodo === t ? "active" : ""}`}
                                            onClick={() => {
                                                setPeriodo(t);
                                                // Resetear valores no usados
                                                if (t === "Año") {
                                                    setMes("");
                                                    setFechaInicio("");
                                                    setFechaFin("");
                                                } else if (t === "Mes") {
                                                    setFechaInicio("");
                                                    setFechaFin("");
                                                } else if (t === "Rango") {
                                                    setAnio("");
                                                    setMes("");
                                                }
                                            }}
                                        >
                                            {t === "Rango" ? "Rango de fechas" : t}
                                        </button>
                                    ))}
                                </div>

                                <div className="periodo-inputs">
                                    {periodo === "Año" && (
                                        <div className="input-group-field">
                                            <label htmlFor="select-anio">Año:</label>
                                            <select
                                                id="select-anio"
                                                value={anio}
                                                onChange={(e) => setAnio(e.target.value)}
                                                className="input-anio"
                                            >
                                                <option value="">-- Seleccionar año --</option>
                                                {listaAnios.map((a) => (
                                                    <option key={a} value={a}>
                                                        {a}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    {periodo === "Mes" && (
                                        <div className="input-group-field">
                                            <label htmlFor="select-mes">Mes:</label>
                                            <div className="mes-inputs">
                                                <select
                                                    id="select-mes-year"
                                                    value={anio}
                                                    onChange={(e) => {
                                                        setAnio(e.target.value);
                                                        setMes(""); // Resetear mes al cambiar año
                                                    }}
                                                >
                                                    <option value="">-- Año --</option>
                                                    {listaAnios.map((a) => (
                                                        <option key={a} value={a}>
                                                            {a}
                                                        </option>
                                                    ))}
                                                </select>
                                                <select
                                                    id="select-mes"
                                                    value={mes}
                                                    onChange={(e) => setMes(e.target.value)}
                                                    disabled={!anio}
                                                >
                                                    <option value="">-- Mes --</option>
                                                    {listaMeses.map((m) => (
                                                        // 🟢 CORRECCIÓN: El valor es SOLO el mes.
                                                        <option key={m.value} value={m.value}>
                                                            {m.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                    {periodo === "Rango" && (
                                        <div className="rango-fechas-inputs">
                                            <label>Inicio:</label>
                                            <input
                                                type="date"
                                                value={fechaInicio}
                                                onChange={(e) => setFechaInicio(e.target.value)}
                                            />
                                            <label>Fin:</label>
                                            <input
                                                type="date"
                                                value={fechaFin}
                                                onChange={(e) => setFechaFin(e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* === 3. Tipo de Proyecto === */}
                            <div className="form-section tipo-proyecto-section">
                                <label className="titulo-seccion"><strong>3. Estado del Proyecto</strong></label>
                                <select
                                    value={tipoProyecto}
                                    onChange={(e) => setTipoProyecto(e.target.value)}
                                    className="input-estado"
                                >
                                    <option value="Finalizados">Finalizados</option>
                                    <option value="EnProceso">En proceso</option>
                                    <option value="Ambos">Ambos</option>
                                </select>
                            </div>
                        </div>
                        {/* ⬆️ FIN DE LÍNEAS DE CÓDIGO FALTANTES ⬆️ */}

                        {/* Botón y barra de progreso */}
                        <div className="boton-generar-section">
                            {isGenerating ? (
                                // 🟢 BARRA DE PROGRESO Y BOTÓN DE CANCELAR
                                <div className="progress-container">
                                    <div className="progress-bar-label">
                                        Generando Reporte: {generationProgress}%
                                    </div>
                                    <div className="progress-bar-wrapper">
                                        <div 
                                            className="progress-bar" 
                                            style={{ width: `${generationProgress}%` }}
                                        ></div>
                                    </div>
                                    <button 
                                        className="btn-cancelar" 
                                        onClick={handleCancelGeneration}
                                    >
                                        <FaTimesCircle className="icon-cancelar" />
                                        Cancelar
                                    </button>
                                </div>
                            ) : (
                                // 🟢 BOTÓN DE GENERAR (visible cuando no se está generando)
                                <>
                                    <button
                                        className="btn-generar"
                                        onClick={handleGenerarReporte}
                                        disabled={seleccionados.length === 0}
                                    >
                                        Generar Reporte
                                    </button>
                                    {seleccionados.length === 0 && (
                                        <p className="alerta-seleccion">
                                            ⚠ Selecciona al menos un departamento para habilitar el reporte.
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* 🟢 VISOR DE PDF */}
            {showPdfViewer && pdfUrl && (
                <PdfViewer 
                    pdfUrl={pdfUrl} 
                    fileName={`Reporte_Proyectos_${new Date().toISOString().slice(0, 10)}.pdf`}
                    onClose={handleClosePdfViewer} 
                />
            )}
        </div>
    );
}