import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUsers, faTaxi, faGlobe } from '@fortawesome/free-solid-svg-icons';
import MapComponent from './components/MapComponent';
import socket from './Socket';
import LogoutButton from './LogoutButton';

const HomePage = () => {
  const id_usuario = localStorage.getItem('id_usuario');

  useEffect(() => {
    console.log('Socket conectado en HomePage:', socket.connected);
  }, []);

  // Styles
  const iconsContainerStyle = {
    position: 'absolute',
    top: '20px',
    right: '20px',
    display: 'flex',
    alignItems: 'center',
    zIndex: 1000 // Ensure icons are above the map
  };

  const iconLinkStyle = {
    marginLeft: '10px', // Space between icons
    color: 'black', // Icon color
    fontSize: '24px' // Icon size
  };

  return (
    <div className="container-fluid" style={{ height: '100vh' }}>
      <div className="row align-items-center" style={{ padding: '20px 0' }}>
        <div className="col text-center">
          <h1>Radio-taxis</h1>
        </div>
        <div className="col-auto" style={{ position: 'absolute', right: '20px', top: '20px' }}>
          <Link to="/user" className="btn btn-primary">
            <FontAwesomeIcon icon={faUser} size="lg" />
          </Link>
          <Link to="/users-list" className="btn btn-secondary ml-2">
            <FontAwesomeIcon icon={faUsers} size="lg" />
          </Link>
          <Link to="/chat" style={iconLinkStyle} className="btn btn-success ml-2">
            <FontAwesomeIcon icon={faTaxi} />
          </Link>
          <Link to="/map" style={iconLinkStyle} className="btn btn-success ml-2">
            <FontAwesomeIcon icon={faGlobe} />
          </Link>
          <LogoutButton /> {/* Añade el botón de logout */}
        </div>
      </div>
      <div className="row">
        <div className="col-md-8" style={{ height: '85vh' }}>
          <MapComponent id_usuario={id_usuario} />
        </div>
        <div className="col-md-4">
          <form>
            <div className="form-group">
              <label htmlFor="originAddress">Dirección origen</label>
              <input type="text" className="form-control" id="originAddress" placeholder="Ingresa la dirección de origen" />
            </div>
            <div className="form-group">
              <label htmlFor="destinationAddress">Dirección destino</label>
              <input type="text" className="form-control" id="destinationAddress" placeholder="Ingresa la dirección de destino" />
            </div>
            <div className="form-group">
              <label htmlFor="price">Precio</label>
              <input type="number" className="form-control" id="price" placeholder="Precio de la carrera" />
            </div>
            <div className="form-group">
              <label htmlFor="rate">Tarifa normal</label>
              <input type="text" className="form-control" id="rate" placeholder="Tarifa aplicada" />
            </div>
            <button type="submit" className="btn btn-primary">Solicitar Taxi</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
