
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegistroPaso1 from './RegistroPaso1';
import Principal from './Principal'
import RegistroPaso2 from './RegistroPaso2';
import GenerarInvitacion from './GenerarInvitacion';
import Login from './Login';
import ChangePassword from './ChangePassword';
import DepProProceso from "./DepProProceso";
import TareasProgreso from './TareasProgreso';
import DepProCompletados from './DepProCompletados';
import ReporteSuperUsuario from './ReporteSuperUsuario';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/ChangePassword" element={<ChangePassword />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/RegistroPaso2" element={<RegistroPaso2 />} />
        <Route path="/GenerarInvitacion" element={<GenerarInvitacion />} />
        <Route path="/RegistroPaso1/:token" element={<RegistroPaso1 />} />
        <Route path="/Principal" element={<Principal />} />
        <Route path="/proyecto/:idProyecto" element={<TareasProgreso />} />
        <Route path="/ReporteSuperUsuario" element={<ReporteSuperUsuario />} />
        <Route path="/proyectosenproceso/:depNombreSlug" element={<DepProProceso />} />
        <Route path="/proyectoscompletados/:depNombreSlug" element={<DepProCompletados />} />
      </Routes>
    </Router>
  );
}

export default App;

