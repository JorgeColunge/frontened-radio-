import React from 'react';
import { Link } from 'react-router-dom';
import UsersMap from './components/UsersMap';
import TaxiRequestButton from './components/TaxiRequestButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faCaretDown } from '@fortawesome/free-solid-svg-icons';

const HomePage = () => {
  const handleLogout = () => {
    // Aquí iría tu lógica de logout, como eliminar el token almacenado, etc.
    console.log('Logout successful');
    // Redirigir al usuario a la página de login
    // window.location = '/login'; // Esto redirigirá al usuario a la página de inicio de sesión
  };

  return (
    <div>
      <h1>Radio-taxis</h1>
      <TaxiRequestButton />
      <UsersMap />

      {/* Botón y dropdown para cerrar sesión */}
      <div className="dropdown" style={{ position: 'absolute', top: 0, right: 0, padding: '10px' }}>
        <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
          <FontAwesomeIcon icon={faCaretDown} />
        </button>
        <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
          <li>
            <Link to="/login" className="dropdown-item" onClick={handleLogout}>
              <FontAwesomeIcon icon={faSignOutAlt} /> Cerrar sesión
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HomePage;
