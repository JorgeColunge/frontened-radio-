import React, { useEffect, useState } from 'react';
import UsersMap from './UsersMap';
import socket from '../Socket';
import TaxiRequestForm from './TaxiRequestForm';
import ReservationRequestForm from './ReservationRequestForm';
import DeliveryRequestForm from './DeliveryRequestForm';
import { CarFront, CalendarCheck, BoxSeam } from 'react-bootstrap-icons';
import AudioRecorderButton from './AudioRecorderButton';

const HomePageContentTipo1 = () => {
  const [activeForm, setActiveForm] = useState('taxi'); // Estado para gestionar el formulario activo

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
    socket.on('new-audio-tipo2', handleNewAudio);

    return () => {
      socket.off('new-audio', handleNewAudio);
      socket.off('new-audio-tipo2', handleNewAudio);
    };
  }, []);

  const renderForm = () => {
    switch (activeForm) {
      case 'taxi':
        return <TaxiRequestForm />;
      case 'reservation':
        return <ReservationRequestForm />;
      case 'delivery':
        return <DeliveryRequestForm />;
      default:
        return <TaxiRequestForm />;
    }
  };

  return (
    <div className="container">
      <div className="row">
      <div className="col-md-5">
          <div className="d-flex justify-content-around mb-3">
            <CarFront 
              onClick={() => setActiveForm('taxi')} 
              size={30} 
              style={{ cursor: 'pointer' }} 
              title="Solicitud de Taxi"
            />
            <CalendarCheck 
              onClick={() => setActiveForm('reservation')} 
              size={30} 
              style={{ cursor: 'pointer' }} 
              title="Reserva"
            />
            <BoxSeam 
              onClick={() => setActiveForm('delivery')} 
              size={30} 
              style={{ cursor: 'pointer' }} 
              title="Domicilio"
            />
          </div>
          {renderForm()}
        </div>
        <div className="col-md-7">
          <UsersMap />
          <br></br>
          <br></br>
        </div>
        
      </div>
      <AudioRecorderButton />
    </div>
  );
};

export default HomePageContentTipo1;
