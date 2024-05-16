import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import HomePage from "./HomePage";
import UsersMap from "./ControlPage";
import UserPage from "./components/UserPage";
import UserList from './components/UserList';
import ChatBot from './components/ChatBot';
import RequestTaxiDriver from './components/App-driver/RequestTaxiDriver';
import RequireAuth from './RequireAuth'; // Importa RequireAuth

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

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handlePopState = (event) => {
      const token = localStorage.getItem('token');
      if (token && location.pathname === '/') {
        navigate('/home');
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate, location]);

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<RequireAuth><HomePage /></RequireAuth>} />
      <Route path="/map" element={<RequireAuth><UsersMap /></RequireAuth>} />
      <Route path="/user" element={<RequireAuth><UserPage /></RequireAuth>} />
      <Route path="/users-list" element={<RequireAuth><UserList /></RequireAuth>} />
      <Route path="/chat" element={<RequireAuth><ChatBot /></RequireAuth>} />
      <Route path="/request-taxi" element={<RequireAuth><RequestTaxiDriver /></RequireAuth>} />
    </Routes>
  );
}

export default App;