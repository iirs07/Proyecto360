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
import { useProyectosOrdenados } from "../hooks/useProyectosOrdenados";

export default function DepProCompletados() {
  // -----------------------------
  // URL y Persistencia
  // -----------------------------
  const { depNombreSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const stateDepId = location.state?.depId;
  const savedDepId = localStorage.getItem("last_depId");
  const depId = stateDepId || savedDepId;
  const departamentoNombre =
    location.state?.nombre ||
    (depNombreSlug ? depNombreSlug.replace(/-/g, " ") : "Departamento");
  const currentDepartamentoSlug = slugify(departamentoNombre);

  // -----------------------------
  // Estados
  // -----------------------------
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);

  // -----------------------------
  // Hook de ordenamiento
  // -----------------------------
  const {
    proyectosOrdenados,
    sortBy,
    sortDirection,
    isMenuOpen,
    setIsMenuOpen,
    handleSelectSort,
    getSortButtonText,
  } = useProyectosOrdenados(proyectos);

  // -----------------------------
  // Fetch de proyectos finalizados
  // -----------------------------
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

    if (stateDepId) localStorage.setItem("last_depId", stateDepId);
    else if (depId) localStorage.setItem("last_depId", depId);

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
  }, [depId, navigate, stateDepId, savedDepId]);

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
    <Layout
      titulo={`PROYECTOS FINALIZADOS DE ${departamentoNombre}`}
      sidebar={
        <MenuDinamico
          departamentoId={depId}
          departamentoNombre={departamentoNombre}
          departamentoSlug={currentDepartamentoSlug}
          activeRoute="completados"
        />
      }
    >
      {/* Controles de ordenamiento */}
      {proyectos.length > 0 && (
        <div className="sort-controls-container">
          <span className="sort-label">Ordenar por:</span>
          <div className="dropdown-sort-menu">
            <button
              className="sort-main-button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {getSortButtonText()}
              <FaCaretDown
                className={`dropdown-arrow ${isMenuOpen ? "open" : ""}`}
              />
            </button>

            {isMenuOpen && (
              <div className="dropdown-options">
                {/* Nombre */}
                <div
                  className={`dropdown-item ${
                    sortBy === "nombre" && sortDirection === "asc"
                      ? "active"
                      : ""
                  }`}
                  onClick={() => handleSelectSort("nombre", "asc")}
                >
                  Nombre (A → Z) - Ascendente
                </div>
                <div
                  className={`dropdown-item ${
                    sortBy === "nombre" && sortDirection === "desc"
                      ? "active"
                      : ""
                  }`}
                  onClick={() => handleSelectSort("nombre", "desc")}
                >
                  Nombre (Z → A) - Descendente
                </div>
                <hr className="dropdown-divider" />

                {/* Fecha Inicio */}
                <div
                  className={`dropdown-item ${
                    sortBy === "fechaInicio" && sortDirection === "asc"
                      ? "active"
                      : ""
                  }`}
                  onClick={() => handleSelectSort("fechaInicio", "asc")}
                >
                  Fecha Inicio - Ascendente
                </div>
                <div
                  className={`dropdown-item ${
                    sortBy === "fechaInicio" && sortDirection === "desc"
                      ? "active"
                      : ""
                  }`}
                  onClick={() => handleSelectSort("fechaInicio", "desc")}
                >
                  Fecha Inicio - Descendente
                </div>

                <hr className="dropdown-divider" />

                {/* Fecha Fin */}
                <div
                  className={`dropdown-item ${
                    sortBy === "fechaFin" && sortDirection === "asc" ? "active" : ""
                  }`}
                  onClick={() => handleSelectSort("fechaFin", "asc")}
                >
                  Fecha Fin - Ascendente
                </div>
                <div
                  className={`dropdown-item ${
                    sortBy === "fechaFin" && sortDirection === "desc"
                      ? "active"
                      : ""
                  }`}
                  onClick={() => handleSelectSort("fechaFin", "desc")}
                >
                  Fecha Fin - Descendente
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lista de proyectos finalizados */}
      <div className="proyectos-linea">
        {proyectosOrdenados.length === 0 ? (
          <p className="proyecto-sin-tareas">
            No hay proyectos finalizados en este departamento.
          </p>
        ) : (
          proyectosOrdenados.map((proyecto) => (
            <div
              key={proyecto.id_proyecto}
              className="proyecto-linea-item completado"
            >
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
                        descripcion: proyecto.descripcion,
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
    </Layout>
  );
}
