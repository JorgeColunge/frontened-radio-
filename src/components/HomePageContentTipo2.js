import React, { useEffect } from 'react'; 
import MapComponent from './MapComponent';
import socket from '../Socket';


const HomePageContentTipo2 = () => {
  const id_usuario = localStorage.getItem('id_usuario');

  useEffect(() => {
    console.log('Socket conectado en HomePage:', socket.connected);
  }, []);

  return (
    <div>
      <MapComponent id_usuario={id_usuario} />
    </div>
  );
};

export default HomePageContentTipo2;