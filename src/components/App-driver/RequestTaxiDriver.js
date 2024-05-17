import React, { useState, useEffect } from 'react';
import axios from 'axios';
import socket from '../../Socket';
import { Modal, Button } from 'react-bootstrap';

const RequestTaxiDriver = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showAssignedNotification, setShowAssignedNotification] = useState(false);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Conexión Socket.IO establecida');
    });

    socket.on('connect_error', (error) => {
      console.error('Error al conectar a Socket.IO:', error);
    });

    socket.on('taxiRequest', (request) => {
      console.log('Solicitud de taxi recibida:', request);
      setPendingRequests((prevRequests) => [
        ...prevRequests,
        { ...request, timer: 10 }
      ]);
    });

    socket.on('taxiRequestAccepted', (data) => {
      console.log("Solicitud de taxi aceptada:", data);
      setPendingRequests((prevRequests) =>
        prevRequests.filter((request) => request.viajeId !== data.id_viaje)
      );
    });

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('taxiRequest');
      socket.off('taxiRequestAccepted');
    };
  }, []);

  const handleAccept = async (request, index) => {
    const acceptTaxiData = {
      id_viaje: request.viajeId,
      id_taxista: localStorage.getItem('id_usuario'), // Asegúrate de proporcionar el ID del taxista correcto
    };

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/geolocation/accept-taxi-request`, acceptTaxiData);
      console.log('Respuesta de la aceptación del taxi:', response.data);
      setPendingRequests((prevRequests) => prevRequests.filter((_, i) => i !== index)); // Elimina la solicitud aceptada
    } catch (error) {
      if (error.response && error.response.status === 409) {
        console.error('El viaje ya ha sido asignado a otro taxista.');
        setShowAssignedNotification(true); // Muestra la notificación de servicio asignado a otro taxista
        setTimeout(() => {
          setShowAssignedNotification(false);
        }, 2000);
        setPendingRequests((prevRequests) => prevRequests.filter((_, i) => i !== index)); // Elimina la solicitud
      } else {
        console.error('Error al aceptar el taxi:', error);
      }
    }
  };

  return (
    <>
      {pendingRequests.length === 0 ? (
        <p>No hay viajes en este momento.</p>
      ) : (
        <Modal show={pendingRequests.length > 0} onHide={() => setPendingRequests([])}>
          <Modal.Header closeButton>
            <Modal.Title>Solicitudes de Taxi</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {pendingRequests.map((request, index) => (
              <div key={index} className="card mb-3">
                <div className="card-body">
                  <h5 className="card-title">Cliente: {request.name}</h5>
                  <p className="card-text">Dirección: {request.address}</p>
                  <p className="card-text">Tiempo restante: {request.timer} segundos</p>
                  <Button variant="primary" onClick={() => handleAccept(request, index)}>
                    Aceptar Viaje
                  </Button>
                </div>
              </div>
            ))}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setPendingRequests([])}>
              Cerrar Todo
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {showAssignedNotification && (
        <div style={{ position: 'fixed', top: 0, width: '100%', backgroundColor: 'red', color: 'white', textAlign: 'center', zIndex: 1000 }}>
          El servicio ya fue asignado a otro taxi
        </div>
      )}
    </>
  );
};

export default RequestTaxiDriver;
