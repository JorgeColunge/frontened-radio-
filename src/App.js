import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import HomePage from "./HomePage";
import UsersMap from "./ControlPage";
import UserPage from "./components/UserPage";
import UserList from './components/UserList';
import ChatBot from './components/ChatBot';
import RequestTaxiDriver from './components/App-driver/RequestTaxiDriver';
import RequireAuth from './RequireAuth';
import RedirectAuth from './RedirectAuth'; // Nuevo componente para redirigir si está autenticado
import NavigationHandler from './NavigationHandler'; // Nuevo componente para manejar la navegación
import socket from './Socket'; // Importa la instancia del socket

function App() {
  useEffect(() => {
    socket.connect();

    const id_usuario = localStorage.getItem('id_usuario');
    if (id_usuario) {
      socket.emit('registerUser', id_usuario);
    }

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <Router>
      <NavigationHandler /> {/* Componente para manejar la navegación */}
      <Routes>
        <Route path="/" element={<RedirectAuth><Login /></RedirectAuth>} />
        <Route path="/register" element={<RedirectAuth><Register /></RedirectAuth>} />
        <Route path="/home" element={<RequireAuth><HomePage /></RequireAuth>} />
        <Route path="/map" element={<RequireAuth><UsersMap /></RequireAuth>} />
        <Route path="/user" element={<RequireAuth><UserPage /></RequireAuth>} />
        <Route path="/users-list" element={<RequireAuth><UserList /></RequireAuth>} />
        <Route path="/chat" element={<RequireAuth><ChatBot /></RequireAuth>} />
        <Route path="/request-taxi" element={<RequireAuth><RequestTaxiDriver /></RequireAuth>} />
      </Routes>
    </Router>
  );
}

export default App;
