import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/Login1.css';
import logo1 from '../imagenes/logo1.png';
import logo2 from '../imagenes/logo4.png';
import logo3 from '../imagenes/logo3.png';

function RegistroPaso2() {
  const location = useLocation();
  const navigate = useNavigate();
  const { correo, password, token: tokenInvitacion } = location.state || {};

  useEffect(() => {
    if (!correo || !password || !tokenInvitacion) {
      alert('Debes completar primero el Paso 1');
      navigate(`/RegistroPaso1/${tokenInvitacion || ''}`);
    }
  }, [correo, password, tokenInvitacion, navigate]);

  const [nombre, setNombre] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [telefono, setTelefono] = useState('');
  const [tokenVerificacion, setTokenVerificacion] = useState('');
  const [loading, setLoading] = useState(false);

  const [errorNombre, setErrorNombre] = useState('');
  const [errorApellidoP, setErrorApellidoP] = useState('');
  const [errorApellidoM, setErrorApellidoM] = useState('');
  const [errorTelefono, setErrorTelefono] = useState('');
  const [errorToken, setErrorToken] = useState('');
  const [errorGeneral, setErrorGeneral] = useState('');

  // Función para mostrar errores temporalmente
  const mostrarErrorTemporal = (setError, mensaje, tiempo = 3000) => {
    setError(mensaje);
    setTimeout(() => setError(''), tiempo);
  };

  // Función para validar y formatear nombres/apellidos
  const validarTexto = (texto) => texto.toUpperCase().replace(/[^A-ZÁÉÍÓÚÜÑ\s]/g, '');
  
  // Función para validar teléfono
  const validarTelefono = (texto) => texto.replace(/\D/g, '').slice(0, 10);

  const handleRegistroFinal = async (e) => {
    e.preventDefault();
    let hasError = false;

    // Limpiar errores previos
    setErrorNombre('');
    setErrorApellidoP('');
    setErrorApellidoM('');
    setErrorTelefono('');
    setErrorToken('');
    setErrorGeneral('');

    if (!nombre) { mostrarErrorTemporal(setErrorNombre, '❌ Ingresa tu nombre'); hasError = true; }
    if (!apellidoPaterno) { mostrarErrorTemporal(setErrorApellidoP, '❌ Ingresa tu apellido paterno'); hasError = true; }
    if (!apellidoMaterno) { mostrarErrorTemporal(setErrorApellidoM, '❌ Ingresa tu apellido materno'); hasError = true; }
    if (!telefono) { mostrarErrorTemporal(setErrorTelefono, '❌ Ingresa tu teléfono'); hasError = true; }
    if (!tokenVerificacion) { mostrarErrorTemporal(setErrorToken, '❌ Ingresa el token'); hasError = true; }
    else if (!/^[A-Za-z0-9]{8}$/.test(tokenVerificacion.trim())) {
      mostrarErrorTemporal(setErrorToken, '❌ El token debe tener 8 caracteres alfanuméricos');
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/RegistroPaso2/invitado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          correo,
          password,
          nombre: nombre.trim(),
          apellidoPaterno: apellidoPaterno.trim(),
          apellidoMaterno: apellidoMaterno.trim(),
          telefono: telefono.trim(),
          token_verificacion: tokenVerificacion.trim(),
          token_invitacion: tokenInvitacion,
        }),
      });
      const data = await res.json();
      if (!res.ok) { mostrarErrorTemporal(setErrorGeneral, data.message || '❌ Error desconocido'); setLoading(false); return; }

      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      console.error('Error de conexión:', error);
      mostrarErrorTemporal(setErrorGeneral, '❌ Error de conexión con el servidor');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-body">
      <div className="login-container registro-compacto">
        <div className="login-logos">
          <img src={logo3} alt="Logo3" className="login-logo3" />
          <img src={logo1} alt="Logo1" className="login-logo1" />
          <img src={logo2} alt="Logo2" className="login-logo2" />
        </div>

        <h1 className="login-title">REGISTRO - PASO 2</h1>

        <div className="login-campo">
          <label>Correo:</label>
          <input type="text" value={correo || ''} className="login-input" disabled />
        </div>

        <div className="login-campo">
          <label>Nombre(s):</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(validarTexto(e.target.value))}
            onPaste={(e) => { e.preventDefault(); setNombre(validarTexto(e.clipboardData.getData('text'))); }}
            placeholder="Ingresa tu nombre"
            className="login-input"
          />
          {errorNombre && <div className="login-error-msg">{errorNombre}</div>}
        </div>

        <div className="login-campo">
          <label>Apellido Paterno:</label>
          <input
            type="text"
            value={apellidoPaterno}
            onChange={(e) => setApellidoPaterno(validarTexto(e.target.value))}
            onPaste={(e) => { e.preventDefault(); setApellidoPaterno(validarTexto(e.clipboardData.getData('text'))); }}
            placeholder="Ingresa tu apellido paterno"
            className="login-input"
          />
          {errorApellidoP && <div className="login-error-msg">{errorApellidoP}</div>}
        </div>

        <div className="login-campo">
          <label>Apellido Materno:</label>
          <input
            type="text"
            value={apellidoMaterno}
            onChange={(e) => setApellidoMaterno(validarTexto(e.target.value))}
            onPaste={(e) => { e.preventDefault(); setApellidoMaterno(validarTexto(e.clipboardData.getData('text'))); }}
            placeholder="Ingresa tu apellido materno"
            className="login-input"
          />
          {errorApellidoM && <div className="login-error-msg">{errorApellidoM}</div>}
        </div>

        <div className="login-campo">
          <label>Teléfono:</label>
          <input
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(validarTelefono(e.target.value))}
            onPaste={(e) => { e.preventDefault(); setTelefono(validarTelefono(e.clipboardData.getData('text'))); }}
            placeholder="Ingresa tu teléfono (10 dígitos)"
            className="login-input"
          />
          {errorTelefono && <div className="login-error-msg">{errorTelefono}</div>}
        </div>

        <div className="login-campo">
          <label>Token de verificación (8 dígitos):</label>
          <input
            type="text"
            value={tokenVerificacion}
            onChange={(e) => setTokenVerificacion(e.target.value.replace(/[^A-Za-z0-9]/g, '').slice(0,8))}
            onPaste={(e) => { e.preventDefault(); setTokenVerificacion(e.clipboardData.getData('text').replace(/[^A-Za-z0-9]/g, '').slice(0,8)); }}
            maxLength={8}
            placeholder="Ingresa el token recibido por correo"
            className="login-input"
          />
          {errorToken && <div className="login-error-msg">{errorToken}</div>}
        </div>

        {errorGeneral && <div className="login-error-general">{errorGeneral}</div>}

        <div className="login-campo" style={{ marginTop: '15px' }}>
          <button type="button" className="login-button" onClick={handleRegistroFinal} disabled={loading}>
            {loading ? <div className="spinner"></div> : 'COMPLETAR REGISTRO'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RegistroPaso2;
