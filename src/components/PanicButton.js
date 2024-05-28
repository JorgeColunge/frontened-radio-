import React, { useEffect } from 'react';
import axios from 'axios';
import { Capacitor, Plugins } from '@capacitor/core';
import VolumeButtonPlugin from '../VolumeButtonPlugin.ts'; // Ajusta la ruta según sea necesario

const PanicButton = () => {
  const id_usuario = localStorage.getItem('id_usuario');

  const handlePanicButtonClick = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/geolocation/panic`, { id_usuario });
      console.log('Panic button clicked, event sent with id_usuario:', id_usuario);
    } catch (error) {
      console.error('Error sending panic event:', error);
    }
  };

  useEffect(() => {
    const registerVolumeButtonListener = async () => {
      if (Capacitor.isNativePlatform()) {
        await VolumeButtonPlugin.addListener('volumeButtonPressed', async () => {
          handlePanicButtonClick();
        });
      }
    };
    registerVolumeButtonListener();
  }, []);

  return (
    <button 
      onClick={handlePanicButtonClick} 
      style={{
        position: 'fixed',
        top: '50%',
        right: '20px',
        transform: 'translateY(-50%)',
        padding: '30px',
        backgroundColor: 'red',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        fontSize: '16px',
        cursor: 'pointer',
        zIndex: 10000,
      }}
    >
    </button>
  );
};

export default PanicButton;
