import React from 'react';
import { FaHome, FaTasks, FaProjectDiagram, FaUsers, FaFileAlt } from "react-icons/fa"; // Importar FaFileAlt
import { useNavigate } from "react-router-dom";
import "../css/global.css";
/**
 * Componente Sidebar específico para el rol de Superusuario.
 * * Este menú combina la navegación de proyectos con una opción de Reportes.
 * @param {string} departamentoId ID del departamento actual.
 * @param {string} departamentoNombre Nombre completo del departamento.
 * @param {string} departamentoSlug Slug del departamento (para la URL).
 * @param {string} activeRoute Clave de la ruta activa para resaltar el ítem ('inicio', 'proceso', 'finalizados', 'reportes').
 * @param {function} onLogout Función de cierre de sesión pasada desde el Layout.
 */
export default function SidebarSuperUsuario({ 
    departamentoId, 
    departamentoNombre,
    departamentoSlug,
    activeRoute,
    onLogout // Recibe la función de cierre de sesión del Layout
}) {
    const navigate = useNavigate();

    // Función unificada de navegación
    const handleNavigate = (routeKey, path) => {
        if (routeKey === 'inicio' || routeKey === 'reportes') {
            navigate(path);
            return;
        }

        // Navegación con parámetros de estado (para persistencia)
        navigate(path, { 
            state: { 
                nombre: departamentoNombre, 
                depId: departamentoId 
            } 
        });
    };

    return (
        <ul>
            <li 
                className={`menu-item ${activeRoute === 'inicio' ? 'active' : ''}`}
                onClick={() => handleNavigate('inicio', '/Principal')}
            >
                <FaHome className="icon" />
                <span className="label">Inicio</span>
            </li>

            {/* Proyectos en Proceso (Necesita datos de departamento) */}
            <li
                className={`menu-item ${activeRoute === 'proceso' ? 'active' : ''}`}
                onClick={() =>
                    handleNavigate('proceso', `/proyectosenproceso/${departamentoSlug}`)
                }
            >
                <FaTasks className="icon" />
                <span className="label">Proyectos en proceso</span>
            </li>
            
            {/* Proyectos Finalizados (Necesita datos de departamento) */}
            <li
                className={`menu-item ${activeRoute === 'finalizados' ? 'active' : ''}`}
                onClick={() =>
                    handleNavigate('finalizados', `/proyectoscompletados/${departamentoSlug}`)
                }
            >
                <FaProjectDiagram className="icon" />
                <span className="label">Proyectos finalizados</span>
            </li>
            
            {/* CERRAR SESIÓN (Usa la función onLogout del Layout) */}
            <li 
                className="menu-item" 
                onClick={onLogout}
            > 
                <FaUsers className="icon" />
                <span className="label">Cerrar sesión</span>
            </li>
        </ul>
    );
}