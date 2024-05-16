import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import socket from './Socket';
import './login.css'; // Asegúrate de importar el CSS

const Login = () => {
  const [id_usuario, setIdUsuario] = useState("");
  const [password, setpassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (!id_usuario || !password) {
    setError("Por favor, complete todos los campos.");
    return;
  }

  const payload = {
    id_usuario,
    password,
  };

  try {
    const response = await axios.post("https://backend-k3yb.onrender.com/api/auth/login", payload);
    alert(`Bienvenido ${response.data.nombre}`);
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("id_usuario", id_usuario);
    socket.emit('registerUser', id_usuario);
    navigate('/home');
  } catch (error) {
    const errorMsg = error.response ? "Error al iniciar sesión. Intente nuevamente." : "Error de red o respuesta no recibida.";
    setError(errorMsg);
  }
  };

  return (
  <div className="login-form">
    <form onSubmit={handleSubmit}>
    {error && <p className="error-message">{error}</p>}
    <h2 style={{ textAlign: 'center', fontWeight: 'bold' }}>Radio-taxis</h2>
    <label>
      ID de usuario:
      <input type="text" value={id_usuario} onChange={(e) => setIdUsuario(e.target.value)} />
    </label>
    <label>
      password:
      <input type="password" value={password} onChange={(e) => setpassword(e.target.value)} />
    </label>
    <input type="submit" value="Iniciar sesión" className="btn btn-primary" />
    <Link to="/register">   ¿No tienes cuenta? Regístrate</Link>
    </form>
  </div>
  );
};

export default Login;
