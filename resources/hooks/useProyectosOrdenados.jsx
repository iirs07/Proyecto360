import { useState, useMemo } from 'react';

/**
 * Hook para manejar el estado y la lógica de ordenamiento de una lista de proyectos.
 * @param {Array<Object>} proyectos La lista de proyectos a ordenar.
 * @returns {Object} Un objeto con los proyectos ordenados, estados y manejadores.
 */
export const useProyectosOrdenados = (proyectos) => {
    // 🟢 ESTADOS ENCAPSULADOS
    const [sortBy, setSortBy] = useState("fechaInicio"); // Criterio inicial
    const [sortDirection, setSortDirection] = useState("asc"); // Dirección inicial
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // 🟢 FUNCIÓN DE ORDENAMIENTO (memoizada)
    const proyectosOrdenados = useMemo(() => {
        if (!proyectos || proyectos.length === 0) return [];

        return [...proyectos].sort((a, b) => {
            let comparison = 0;
            const direction = sortDirection === "asc" ? 1 : -1;

            if (sortBy === "fechaInicio") {
                const dateA = new Date(a.pf_inicio);
                const dateB = new Date(b.pf_inicio);
                comparison = dateA - dateB;
            } else if (sortBy === "fechaFin") {
                const dateA = new Date(a.pf_fin);
                const dateB = new Date(b.pf_fin);
                comparison = dateA - dateB;
            } else if (sortBy === "nombre") {
                comparison = a.p_nombre.localeCompare(b.p_nombre);
            }

            return comparison * direction;
        });
    }, [proyectos, sortBy, sortDirection]); // Dependencias para re-cálculo

    // 🟢 FUNCIÓN DE MANEJO DE SELECCIÓN
    const handleSelectSort = (newSortBy, newSortDirection) => {
        setSortBy(newSortBy);
        setSortDirection(newSortDirection);
        setIsMenuOpen(false); // Cierra el menú al seleccionar
    };

    // 🟢 FUNCIÓN PARA OBTENER EL TEXTO DEL BOTÓN
    const getSortButtonText = () => {
        const criterioMap = {
            fechaInicio: "Fecha Inicio",
            fechaFin: "Fecha Fin",
            nombre: "Nombre",
        };
        const icon = sortDirection === 'asc' ? ' ▲ (Asc.)' : ' ▼ (Desc.)'; 
        return `${criterioMap[sortBy] || 'Fecha Inicio'} ${icon}`;
    };

    return {
        proyectosOrdenados,
        sortBy,
        sortDirection,
        isMenuOpen,
        setIsMenuOpen,
        handleSelectSort,
        getSortButtonText,
    };
};