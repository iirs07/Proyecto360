import React from "react";
import "../css/ProgresoProyecto.css";

export default function ProgresoProyecto({ progresoInicial, tareasTotales, tareasCompletadas }) {
  const p = Number(progresoInicial) || 0;

  const getColorProgreso = () => {
    if (p < 50) return "linear-gradient(90deg, #ff4d4d, #ff9999)";
    if (p < 80) return "linear-gradient(90deg, #ffcc00, #ffd633)";
    return "linear-gradient(90deg, #4caf50, #81c784)";
  };

  return (
    <div className="contenedor-progreso-chart">
      {tareasTotales > 0 && (
        <div className="barra-fondo" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={p}>
          <div
            className="barra-progreso"
            style={{
              width: `${p}%`,
              background: getColorProgreso(),
              transition: "width 0.5s ease, background 0.3s ease",
            }}
          >
            {p > 0 && <span className="porcentaje-en-barra">{p}%</span>}
          </div>
        </div>
      )}
      <div className="texto-progreso">
        <p>
          {tareasCompletadas} de {tareasTotales} tareas completadas ({p}%)
        </p>
      </div>
    </div>
  );
}
