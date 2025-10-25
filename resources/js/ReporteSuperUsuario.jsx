import React, { useState, useEffect } from "react";
import { FaHome, FaFileAlt, FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../css/global.css";
import "../css/ReporteSuperUsuario.css"; // Asegúrate de tener este archivo CSS
import logo3 from "../imagenes/logo3.png";

export default function ReporteSuperUsuario() {
  // --- ESTADO INICIAL ---
  const [areas, setAreas] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [areasAbiertas, setAreasAbiertas] = useState({});
  const [tipoProyecto, setTipoProyecto] = useState("Ambos");
  const [periodo, setPeriodo] = useState("Rango"); // 'Año', 'Mes', 'Rango'
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [anio, setAnio] = useState("");
  const [mes, setMes] = useState(""); // Formato YYYY-MM
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  // --- DATOS AUXILIARES ---
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

  // --- LÓGICA DE CARGA DE DATOS (API) ---
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/departamentos");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Adaptar la estructura para el componente
        const areasAdaptadas = data.map(area => ({
          id: area.id,
          nombre: area.nombre,
          departamentos: area.departamentos ? area.departamentos.map(dep => ({
            id_departamento: dep.id_departamento,
            d_nombre: dep.d_nombre,
          })) : [] // Asegura que 'departamentos' sea un array
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

  // --- HANDLERS DE SELECCIÓN ---
  
  // Handler para seleccionar/deseleccionar un departamento individual
  const toggleDepartamento = (depId) => {
    setSeleccionados(prev =>
      prev.includes(depId) ? prev.filter(d => d !== depId) : [...prev, depId]
    );
  };

  // Handler para seleccionar/deseleccionar todos los departamentos de un área
  const toggleArea = (area) => {
    const depIds = area.departamentos.map(dep => dep.id_departamento);
    const allSelected = depIds.every(id => seleccionados.includes(id));

    if (allSelected) {
      // Deseleccionar todos
      setSeleccionados(prev =>
        prev.filter(id => !depIds.includes(id))
      );
    } else {
      // Seleccionar todos (usando Set para evitar duplicados)
      setSeleccionados(prev => [
        ...new Set([...prev, ...depIds])
      ]);
    }
  };

  const toggleAbrirArea = (areaId) => {
    setAreasAbiertas(prev => ({ ...prev, [areaId]: !prev[areaId] }));
  };

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  // --- GENERACIÓN DEL REPORTE ---
  const handleGenerarReporte = () => {
    if (seleccionados.length === 0) {
      alert("⚠️ Error: Selecciona al menos un departamento para generar el reporte.");
      return;
    }

    let url = `/reporte?tipoProyecto=${tipoProyecto}&departamentos=${seleccionados.join(",")}`;

    // Lógica para añadir los parámetros de tiempo
    if (periodo === "Año" && anio) {
      url += `&anio=${anio}`;
    } else if (periodo === "Mes" && mes) {
      // Mes contiene el año y mes (YYYY-MM), que es lo que el servidor suele necesitar
      url += `&mes=${mes}`;
    } else if (periodo === "Rango" && fechaInicio && fechaFin) {
      url += `&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
    } else if (periodo !== "Rango") {
        // Validación adicional si no se seleccionó fecha/mes/año cuando se requiere
        alert(`⚠️ Error: Debes seleccionar un valor para el periodo de tipo "${periodo}".`);
        return;
    }

    console.log("URL de Reporte generada:", url);
    // navigate(url); // Descomentar para navegar a la ruta de reporte
  };


  // --- RENDERIZADO JSX ---
  return (
    <div className="main-layout">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        {/* ... Menú de navegación ... */}
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
            
            <div className="filtros-grid"> {/* Estructura de grid para los filtros */}
              
              {/* === 1. SELECCIÓN DE ÁREAS/DEPARTAMENTOS === */}
              <div className="form-section area-selection-panel">
                <label className="titulo-seccion"><strong>1. Seleccionar Áreas / Departamentos</strong></label>
                
                {isLoading ? (
                    <p>Cargando áreas...</p>
                ) : (
                    <div className="areas-list-scroll"> {/* Contenedor con scroll para listas largas */}
                        {areas.map(area => (
                            <div key={area.id} className="area-item-contenedor">
                                {/* Header del área con checkbox para TODA el área */}
                                <div className="area-header">
                                    <input
                                        type="checkbox"
                                        checked={area.departamentos.every(dep => seleccionados.includes(dep.id_departamento))}
                                        onChange={() => toggleArea(area)}
                                    />
                                    <span 
                                        className="area-nombre" 
                                        onClick={() => toggleAbrirArea(area.id)}
                                    >
                                        {area.nombre}
                                    </span>
                                    <span className="flecha-area" onClick={() => toggleAbrirArea(area.id)}>
                                        {areasAbiertas[area.id] ? "▼" : "▶"}
                                    </span>
                                </div>

                                {/* Listado de Departamentos (Sub-items) */}
                                {areasAbiertas[area.id] && (
                                    <div className="area-departamentos-submenu">
                                        {area.departamentos.map(dep => (
                                           <label key={dep.id_departamento} className="departamento-label">
                            <input
                                type="checkbox"
                                checked={seleccionados.includes(dep.id_departamento)}
                                onChange={() => toggleDepartamento(dep.id_departamento)}
                            />
                            <span className="departamento-texto">{dep.d_nombre}</span> {/* Nuevo span */}
                        </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
              </div>

              {/* === 2. FILTRO DE PERÍODO === */}
              <div className="form-section periodo-section">
                <label className="titulo-seccion"><strong>2. Seleccionar Periodo</strong></label>

                {/* Botones de Pestaña (Mejor UX que un <select>) */}
                <div className="periodo-tipo-tabs">
                    {['Año', 'Mes', 'Rango'].map(t => (
                        <button
                            key={t}
                            className={`periodo-tab ${periodo === t ? 'active' : ''}`}
                            onClick={() => setPeriodo(t)}
                        >
                            {t === 'Rango' ? 'Rango de fechas' : t}
                        </button>
                    ))}
                </div>

                {/* Contenedor de Inputs Dinámicos */}
                <div className="periodo-inputs">
                    {periodo === "Año" && (
                        <div className="input-group-field">
                            <label htmlFor="select-anio">Año:</label>
                            <select id="select-anio" value={anio} onChange={e => setAnio(e.target.value)} className="input-anio">
                                <option value="">-- Seleccionar año --</option>
                                {listaAnios.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>
                    )}
                    {periodo === "Mes" && (
                        <div className="input-group-field">
                            <label htmlFor="select-mes">Mes:</label>
                            {/* Usamos un select de Meses en lugar del input type="month" por compatibilidad y mejor UX */}
                            <div className="mes-inputs">
                                <select 
                                    id="select-mes-year"
                                    value={anio} 
                                    onChange={e => setAnio(e.target.value)}
                                >
                                    <option value="">-- Año --</option>
                                    {listaAnios.map(a => <option key={a} value={a}>{a}</option>)}
                                </select>
                                <select 
                                    id="select-mes"
                                    value={mes} 
                                    onChange={e => setMes(e.target.value)}
                                    // Deshabilita si no hay año seleccionado
                                    disabled={!anio}
                                >
                                    <option value="">-- Mes --</option>
                                    {listaMeses.map(m => <option key={m.value} value={`${anio}-${m.value}`}>{m.label}</option>)}
                                </select>
                            </div>
                        </div>
                    )}
                    {periodo === "Rango" && (
                        <div className="rango-fechas-inputs">
                            <label>Inicio:</label>
                            <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
                            <label>Fin:</label>
                            <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
                        </div>
                    )}
                </div>
              </div>

              {/* === 3. TIPO DE PROYECTO (Estado) === */}
              <div className="form-section tipo-proyecto-section">
                <label className="titulo-seccion"><strong>3. Estado del Proyecto</strong></label>
                <select 
                    value={tipoProyecto} 
                    onChange={e => setTipoProyecto(e.target.value)} 
                    className="input-estado"
                >
                    <option value="Finalizados">Finalizados</option>
                    <option value="EnProceso">En proceso</option>
                    <option value="Ambos">Ambos</option>
                </select>
              </div>

            </div>

            {/* Botón de Reporte */}
            <div className="boton-generar-section">
                <button 
                    className="btn-generar" 
                    onClick={handleGenerarReporte} 
                    disabled={seleccionados.length === 0}
                >
                    Generar Reporte
                </button>
                {seleccionados.length === 0 && (
                    <p className="alerta-seleccion">⚠ Selecciona al menos un departamento para habilitar el reporte.</p>
                )}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
