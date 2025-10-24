import React, { useState, useEffect } from 'react';
import '../css/GenerarInvitacion.css';

function GenerarInvitacion() {
  const [rol, setRol] = useState('Usuario');
  const [departamentos, setDepartamentos] = useState([]);
  const [idDepartamento, setIdDepartamento] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/departamentos')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP status ${res.status}`);
        return res.json();
      })
      .then(data => {
        // Aplanar todos los departamentos de todas las áreas
        const allDepartamentos = data.flatMap(area => area.departamentos);
        setDepartamentos(allDepartamentos);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetch departamentos:', err);
        setError('No se pudieron cargar los departamentos');
        setLoading(false);
      });
  }, []);

  const handleGenerar = async () => {
    if (!idDepartamento) {
      alert('Selecciona un departamento');
      return;
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/api/invitaciones/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rol,
          id_departamento: idDepartamento,
          creado_por: 1,
          max_usos: cantidad
        }),
      });

      const data = await res.json();

      if (data.ok) {
        setLink(data.link);
        alert('Invitación generada correctamente');
      } else {
        alert('Error al generar invitación: ' + (data.error || ''));
      }
    } catch (err) {
      console.error('Error de conexión:', err);
      alert('Error de conexión al servidor');
    }
  };

  const handleCopiar = () => {
    if (link) {
      navigator.clipboard.writeText(link);
      alert('Link copiado al portapapeles');
    }
  };

  return (
    <div className="generar-invitacion-wrapper">
      <div className="generar-invitacion-container">
        <h2>Generar Invitación</h2>

        {/* Rol */}
        <label>Rol:</label>
        <select value={rol} onChange={e => setRol(e.target.value)}>
          <option value="Usuario">Usuario</option>
          <option value="Administrador">Administrador</option>
          <option value="Jefe">Jefe</option>
          <option value="Superusuario">Superusuario</option>
        </select>

        {/* Departamento */}
        <label>Departamento:</label>
        {loading ? (
          <p>Cargando departamentos...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <select value={idDepartamento} onChange={e => setIdDepartamento(e.target.value)}>
            <option value="">Selecciona departamento</option>
            {departamentos.map(dep => (
              <option key={dep.id_departamento} value={dep.id_departamento}>
                {dep.d_nombre}
              </option>
            ))}
          </select>
        )}

        {/* Cantidad máxima de registros */}
        <label>Cantidad máxima de registros:</label>
        <input
          type="number"
          value={cantidad}
          min={1}
          onChange={e => setCantidad(parseInt(e.target.value))}
        />

        {/* Botones */}
        <div className="botones-wrapper">
          <button onClick={handleGenerar}>Generar Link</button>
          {link && <button onClick={handleCopiar}>Copiar Link</button>}
        </div>

        {/* Link generado */}
        {link && (
          <div className="link-container">
            <p>Link de invitación:</p>
            <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
          </div>
        )}
      </div>
    </div>
  );
}

export default GenerarInvitacion;
