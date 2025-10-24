import React, { useState, useEffect } from "react";
import { FaHome, FaFileAlt, FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../css/global.css";
import "../css/ReporteSuperUsuario.css";
import logo3 from "../imagenes/logo3.png";

export default function ReporteSuperUsuario() {
  const [areas, setAreas] = useState([]); // 🔹 Ahora se llenará con la API
  const [seleccionados, setSeleccionados] = useState([]);
  const [areasAbiertas, setAreasAbiertas] = useState({});
  const [tipoProyecto, setTipoProyecto] = useState("Ambos");
  const [periodo, setPeriodo] = useState("Rango");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [anio, setAnio] = useState("");
  const [mes, setMes] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navigate = useNavigate();

  // 🔹 useEffect para cargar las áreas y departamentos al iniciar
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/departamentos");
        const data = await response.json();

        const areasAdaptadas = data.map(area => ({
          id: area.id,
          nombre: area.nombre,
          departamentos: area.departamentos.map(dep => ({
            id_departamento: dep.id_departamento,
            d_nombre: dep.d_nombre
          }))
        }));
      setAreas(areasAdaptadas);
      } catch (error) {
        console.error("Error al obtener las áreas:", error);
      }
    };

    fetchAreas();
  }, []);

  const toggleDepartamento = (dep) => {
    setSeleccionados(prev =>
      prev.includes(dep) ? prev.filter(d => d !== dep) : [...prev, dep]
    );
  };

  const toggleArea = (area) => {
  const allSelected = area.departamentos.every(dep => seleccionados.includes(dep.id_departamento));

  if (allSelected) {
    // Deseleccionar todos los departamentos de esta área
    setSeleccionados(prev =>
      prev.filter(id => !area.departamentos.some(dep => dep.id_departamento === id))
    );
  } else {
    // Seleccionar todos los departamentos de esta área
    setSeleccionados(prev => [
      ...new Set([...prev, ...area.departamentos.map(dep => dep.id_departamento)])
    ]);
  }
};


  const toggleAbrirArea = (areaId) => {
    setAreasAbiertas(prev => ({ ...prev, [areaId]: !prev[areaId] }));
  };

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  const handleGenerarReporte = () => {
    if (seleccionados.length === 0) {
      alert("Selecciona al menos un departamento.");
      return;
    }

    let url = `/reporte?tipoProyecto=${tipoProyecto}&departamentos=${seleccionados.join(",")}`;

    if (periodo === "Año") url += `&anio=${anio}`;
    else if (periodo === "Mes") url += `&mes=${mes}`;
    else url += `&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;

    console.log("URL generada:", url);
  };

  const listaAnios = [];
  const anioActual = new Date().getFullYear();
  for (let i = anioActual - 10; i <= anioActual + 5; i++) listaAnios.push(i);

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
            <span className="titulo-barra-global">
              GENERAR REPORTE DE PROYECTOS DE LOS DEPARTAMENTOS
            </span>
          </div>
        </div>

        <div className="reporte-container">
          <div className="main-form-container">
            <div className="form-section">
              <label className="titulo-seccion"><strong>Seleccionar áreas/departamentos</strong></label>
              <div className="areas-container">
              {areas.length === 0 ? (
                <p>Cargando áreas...</p>
              ) : (
                areas.map(area => (
                  <div key={area.id} className="area-item">
                    {/* Header del área */}
                    <div className="area-header">
                      <input
                        type="checkbox"
                        checked={area.departamentos.every(dep => seleccionados.includes(dep.id_departamento))}
                        onChange={() => toggleArea(area)}
                      />
                      <span className="area-nombre">{area.nombre}</span>
                      <span className="flecha-area" onClick={() => toggleAbrirArea(area.id)}>
                        {areasAbiertas[area.id] ? "▼" : "▶"}
                      </span>
                    </div>

                          {/* Departamentos de esta área */}
                          {areasAbiertas[area.id] && (
                          <div className="area-departamentos">
                            {area.departamentos.map(dep => (
                              <div key={dep.id_departamento}>
                                <label>
                                  <input
                                    type="checkbox"
                                    checked={seleccionados.includes(dep.id_departamento)}
                                    onChange={() => toggleDepartamento(dep.id_departamento)}
                                  />
                                  {dep.d_nombre}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                  {/* Periodo */}
                  <div className="periodo-section">
                    <label><strong>Seleccionar periodo:</strong></label>
                    <div className="periodo-row">
                      <span>Tipo:</span>
                      <select value={periodo} onChange={e => setPeriodo(e.target.value)}>
                        <option value="Año">Año</option>
                        <option value="Mes">Mes</option>
                        <option value="Rango">Rango de fechas</option>
                      </select>

                      {periodo === "Año" && (
                        <>
                          <span>Año:</span>
                          <select value={anio} onChange={e => setAnio(e.target.value)}>
                            <option value="">-- Seleccionar año --</option>
                            {listaAnios.map(a => <option key={a} value={a}>{a}</option>)}
                          </select>
                        </>
                      )}
                      {periodo === "Mes" && (
                        <>
                          <span>Mes:</span>
                          <input type="month" value={mes} onChange={e => setMes(e.target.value)} />
                        </>
                      )}
                      {periodo === "Rango" && (
                        <>
                          <span>Inicio:</span>
                          <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
                          <span>Fin:</span>
                          <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
                        </>
                      )}
                    </div>
                  </div>

                  {/* Tipo de proyecto */}
                  <div className="tipo-proyecto-section">
                    <label><strong>Tipo de proyectos:</strong></label>
                    <select value={tipoProyecto} onChange={e => setTipoProyecto(e.target.value)}>
                      <option value="Finalizados">Finalizados</option>
                      <option value="EnProceso">En proceso</option>
                      <option value="Ambos">Ambos</option>
                    </select>
                  </div>

                  <div className="boton-generar-section">
                    <button className="btn-generar" onClick={handleGenerarReporte}>
                      Generar Reporte
                    </button>
                  </div>
                </div>
              </div>
            </div>

      </div>
    </div>
  );
}
