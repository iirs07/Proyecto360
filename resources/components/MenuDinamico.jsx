import React from 'react';
import SidebarSuperUsuario from './SidebarSuperUsuario';
// Importa tus otros Sidebars aquí (debes crearlos):
// import SidebarJefe from './SidebarJefe'; 
// import SidebarAdministrador from './SidebarAdministrador';

/**
 * Función auxiliar para obtener el rol del usuario.
 * * NOTA: Esta implementación es SIMULADA. Debes ajustarla
 * * para que lea el rol desde tu sistema de autenticación (JWT, Contexto, etc.).
 */
function obtenerRol() {
    // Lectura del rol guardado para demostración. 
    // En una aplicación real, probablemente leerías esto desde un hook de Auth.
    return localStorage.getItem('user_role') || 'Superusuario'; 
}

/**
 * Componente que selecciona y renderiza el Sidebar correcto basado en el rol del usuario.
 * @param {Object} props Todas las propiedades necesarias para el Sidebar (departamentoId, activeRoute, onLogout, etc.).
 */
export default function MenuDinamico(props) {
    const rol = obtenerRol();

    // 🎯 Mapeo de roles a componentes Sidebar
    const SidebarComponentes = {
        'Superusuario': SidebarSuperUsuario,
        // Agrega tus otros roles aquí:
        'Jefe': SidebarSuperUsuario, // <-- ¡REEMPLAZAR con SidebarJefe!
        'Administrador': SidebarSuperUsuario, // <-- ¡REEMPLAZAR con SidebarAdministrador!
    };

    const CurrentSidebar = SidebarComponentes[rol];

    // Manejo de rol no encontrado o nulo
    if (!CurrentSidebar) {
        // En lugar de un error, puedes devolver un mensaje o un menú limitado
        return <div>No hay menú asignado para el rol: {rol}</div>;
    }

    // Renderiza el componente de Sidebar seleccionado, 
    // pasándole todas las props que recibe MenuDinamico (ej: onLogout, departamentoId, etc.)
    return <CurrentSidebar {...props} />;
}