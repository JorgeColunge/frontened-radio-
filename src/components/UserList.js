import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';


function UserList() {
  const [users, setUsers] = useState([]); // Estado para almacenar los usuarios

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('https://backend-k3yb.onrender.com/api/auth/users', { // Asegúrate de usar la URL correcta
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setUsers(data); // Actualizar el estado con la lista de usuarios
      } catch (error) {
        console.error('There was an error!', error);
      }
    };

    fetchUsers();
  }, []);

  const backButtonStyle = {
    position: 'absolute',
    bottom: '20px',
    right: '20px',
    zIndex: 1000
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-3">Lista de Conductores</h1>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Tipo</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id_usuario}>
              <td>{user.id_usuario}</td>
              <td>{user.nombre}</td>
              <td>{user.email}</td>
              <td>{user.tipo}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={backButtonStyle} >
        <Link to="/home" className="btn btn-secondary">
          <FontAwesomeIcon icon={faArrowLeft} />
        </Link>
      </div>
    </div>
  );
}

export default UserList;
