// src/pages/HomePageContentTipo2.js
import React, { useEffect } from 'react'; 
import MapComponent from './MapComponent';
import socket from '../Socket';
import PanicButton from '../components/PanicButton';
import AudioRecorderButtonTipo2 from '../components/AudioRecorderButtonTipo2';

const HomePageContentTipo2 = () => {
  const id_usuario = localStorage.getItem('id_usuario');

  useEffect(() => {
    console.log('Socket conectado en HomePage:', socket.connected);

    const handleNewAudio = ({ audioUrl }) => {
      const fullAudioUrl = `${process.env.REACT_APP_API_URL}${audioUrl}`;
      console.log(fullAudioUrl);
      if (window.audioPlaybackAllowed) {
        const audio = new Audio(fullAudioUrl);
        audio.play();
      }
    };

    socket.on('new-audio', handleNewAudio);

    const handleNewAudioTipo2 = ({ audioUrl }) => {
      const fullAudioUrl = `${process.env.REACT_APP_API_URL}${audioUrl}`;
      console.log(fullAudioUrl);
      if (window.audioPlaybackAllowed) {
        const audio = new Audio(fullAudioUrl);
        audio.play();
      }
    };

    socket.on('new-audio-tipo2', handleNewAudioTipo2);

    return () => {
      socket.off('new-audio', handleNewAudio);
      socket.off('new-audio-tipo2', handleNewAudioTipo2);
    };
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <MapComponent id_usuario={id_usuario} />
      <PanicButton />
      <AudioRecorderButtonTipo2 />
    </div>
  );
};

export default HomePageContentTipo2;
