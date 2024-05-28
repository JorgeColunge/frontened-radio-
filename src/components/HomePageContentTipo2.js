// src/pages/HomePageContentTipo2.js
import React, { useEffect } from 'react'; 
import MapComponent from './MapComponent';
import socket from '../Socket';
import PanicButton from '../components/PanicButton';

const HomePageContentTipo2 = () => {
  const id_usuario = localStorage.getItem('id_usuario');

  useEffect(() => {
    console.log('Socket conectado en HomePage:', socket.connected);
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <MapComponent id_usuario={id_usuario} />
      <PanicButton />
    </div>
  );
};

export default HomePageContentTipo2;
