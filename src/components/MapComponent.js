import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { icon } from 'leaflet';
import axios from 'axios';
import socket from '../Socket';
import { Card, Button } from 'react-bootstrap';
import 'leaflet/dist/leaflet.css';

const containerStyle = {
  width: '100%',
  height: '400px',
  border: '2px solid yellow'
};

const taxiIcon = icon({
  iconUrl: '/imagenes/car_topview.svg',
  iconSize: [40, 40]
});

const clientIcon = icon({
  iconUrl: '/imagenes/Map_pin_icon.svg.png',
  iconSize: [40, 40]
});

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = lat1 * Math.PI / 180; // φ, λ en radianes
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon1 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // en metros
};

const snapToRoad = async (latitude, longitude) => {
  try {
    const response = await axios.get(`https://router.project-osrm.org/nearest/v1/driving/${longitude},${latitude}`);
    if (response.data && response.data.waypoints.length > 0) {
      const { location } = response.data.waypoints[0];
      return { lat: location[1], lng: location[0] };
    }
    return { lat: latitude, lng: longitude };
  } catch (error) {
    console.error("Error al ajustar a la vía:", error);
    return { lat: latitude, lng: longitude };
  }
};

const MapComponent = ({ id_usuario }) => {
  const [location, setLocation] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [showAssignedNotification, setShowAssignedNotification] = useState(false);
  const [clientInfo, setClientInfo] = useState({});
  const [showClientInfo, setShowClientInfo] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [route, setRoute] = useState([]);
  const [accepted, setAccepted] = useState(false);

  const navigateToClient = () => {
    if (!clientInfo.latitud || !clientInfo.longitud || !clientInfo.latitud_fin || !clientInfo.longitud_fin) {
      console.error('La información de la ubicación del cliente o del destino no está completamente definida.');
      return;
    }

    const pickupLocation = `${clientInfo.latitud},${clientInfo.longitud}`;
    const finalDestination = `${clientInfo.latitud_fin},${clientInfo.longitud_fin}`;
    const googleMapsNavigationUrl = `google.navigation:q=${finalDestination}&waypoints=${pickupLocation}`;
    window.open(googleMapsNavigationUrl, '_blank');
  };

  const sendLocationToServer = (latitude, longitude) => {
    const payload = { id_usuario, latitude, longitude };
    axios.post(`${process.env.REACT_APP_API_URL}/api/geolocation/update-location`, payload)
      .then(response => {
        console.log("Respuesta del servidor:", response.data);
      })
      .catch(error => {
        console.error("Error al enviar la ubicación:", error);
      });
  };

  const handleAccept = async (request, index) => {
    const acceptTaxiData = {
      id_viaje: request.viajeId,
      id_taxista: id_usuario
    };

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/geolocation/accept-taxi-request`, acceptTaxiData);
      console.log('Respuesta de la aceptación del taxi:', response.data);
      setShowNotification(true);
      setShowMap(true);
      setAccepted(true);
      setTimeout(() => {
        setShowNotification(false);
      }, 2000);
      setPendingRequests((prevRequests) => prevRequests.filter((_, i) => i !== index));
    } catch (error) {
      if (error.response && error.response.status === 409) {
        console.error('El viaje ya ha sido asignado a otro taxista.');
        setShowAssignedNotification(true);
        setTimeout(() => {
          setShowAssignedNotification(false);
        }, 2000);
        setPendingRequests((prevRequests) => prevRequests.filter((_, i) => i !== index));
      } else {
        console.error('Error al aceptar el taxi:', error);
      }
    }
  };

  useEffect(() => {
    const getRoute = async (origin, destination) => {
      try {
        const response = await axios.get(`https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`);
        if (response.data && response.data.routes.length > 0) {
          const route = response.data.routes[0].geometry.coordinates.map(coord => ({
            lat: coord[1],
            lng: coord[0]
          }));
          setRoute(route);
        }
      } catch (error) {
        console.error('Error al obtener la ruta:', error);
      }
    };

    const handleConnect = () => {
      console.log('Conexión Socket.IO establecida');
    };

    const handleConnectError = (error) => {
      console.error('Error al conectar a Socket.IO:', error);
    };

    const handleTaxiRequest = (request) => {
      console.log('Solicitud de taxi recibida:', request);
      setPendingRequests((prevRequests) => [
        ...prevRequests,
        { ...request, timer: 10 }
      ]);
      setShowNotification(false);
    };

    const handleTaxiRequestAccepted = (data) => {
      console.log("Solicitud de taxi aceptada:", data);
      setPendingRequests((prevRequests) =>
        prevRequests.filter((request) => request.viajeId !== data.id_viaje)
      );
    };

    const handleAssignedTaxi = (data) => {
      console.log("Taxista asignado al viaje:", data);
      setClientInfo({
        nombre: data.nombre,
        telefono: data.telefono,
        direccion: data.direccion,
        latitud: data.latitud,
        longitud: data.longitud,
        direccion_fin: data.direccion_fin,
        latitud_fin: data.latitud_fin,
        longitud_fin: data.longitud_fin
      });
      setShowClientInfo(true);
      getRoute({ lat: data.latitud, lng: data.longitud }, { lat: data.latitud_fin, lng: data.longitud_fin });
    };

    socket.on('connect', handleConnect);
    socket.on('connect_error', handleConnectError);
    socket.on('taxiRequest', handleTaxiRequest);
    socket.on('taxiRequestAccepted', handleTaxiRequestAccepted);
    socket.on('assignedTaxi', handleAssignedTaxi);

    const updateLocation = async () => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const snappedPosition = await snapToRoad(latitude, longitude);

            const distanceMoved = location ? calculateDistance(snappedPosition.lat, snappedPosition.lng, location.lat, location.lng) : 0;
            if (distanceMoved >= 30 || !location) {
              setLocation(snappedPosition);
              await sendLocationToServer(snappedPosition.lat, snappedPosition.lng);
            }
          },
          (error) => {
            console.error(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          }
        );
      } else {
        console.log('La geolocalización no está disponible en este navegador.');
      }
    };

    const intervalId = setInterval(() => {
      if (!accepted) {
        updateLocation();
      }
    }, 5000);

    return () => {
      clearInterval(intervalId);
      socket.off('connect', handleConnect);
      socket.off('connect_error', handleConnectError);
      socket.off('taxiRequest', handleTaxiRequest);
      socket.off('taxiRequestAccepted', handleTaxiRequestAccepted);
      socket.off('assignedTaxi', handleAssignedTaxi);
    };
  }, [id_usuario, location, clientInfo, accepted]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPendingRequests(prevRequests =>
        prevRequests
          .map(req => ({ ...req, timer: req.timer - 1 }))
          .filter(req => req.timer > 0)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {accepted && (
        <div className="mt-3" style={{ border: '1px solid gray', padding: '10px' }}>
          <h2 style={{ textAlign: 'left' }}>Información del cliente</h2>
          {showClientInfo && (
            <div style={{ textAlign: 'left', paddingBottom: '10px' }}>
              <p style={{ margin: '5px 0' }}>Nombre: {clientInfo.nombre}</p>
              <p style={{ margin: '5px 0' }}>De: {clientInfo.direccion}</p>
              <p style={{ margin: '5px 0' }}>Hasta: {clientInfo.direccion_fin}</p>
            </div>
          )}
        </div>
      )}
      <hr style={{ borderTop: '2px solid gray', width: '100%' }} />

      <div className="text-center mt-3">
        <h3>{accepted ? "Recorrido del viaje" : (pendingRequests.length > 0 ? "Viajes" : "No hay solicitudes de taxis en este momento.")}</h3>
      </div>

      {showMap && location && (
        <MapContainer
          center={location}
          zoom={15}
          style={containerStyle}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={location} icon={taxiIcon}>
            <Popup>
              Tu ubicación.
            </Popup>
          </Marker>
          {showClientInfo && (
            <>
              <Marker position={[clientInfo.latitud, clientInfo.longitud]} icon={clientIcon}>
                <Popup>
                  {clientInfo.nombre}
                </Popup>
              </Marker>
              <Marker position={[clientInfo.latitud_fin, clientInfo.longitud_fin]} icon={clientIcon}>
                <Popup>
                  Destino
                </Popup>
              </Marker>
              {route.length > 0 && <Polyline positions={route} color="blue" />}
            </>
          )}
        </MapContainer>
      )}

      {showClientInfo && (
        <Button variant="primary" onClick={() => navigateToClient()}>
          Navegar al Cliente
        </Button>
      )}

      {showNotification && (
        <div style={{ position: 'fixed', top: 0, width: '100%', backgroundColor: 'green', color: 'white', textAlign: 'center' }}>
          Has sido asignado al viaje
        </div>
      )}

      {showAssignedNotification && (
        <div style={{ position: 'fixed', top: 0, width: '100%', backgroundColor: 'red', color: 'white', textAlign: 'center', zIndex: 1000 }}>
          El servicio ya fue asignado a otro taxi
        </div>
      )}

      <div className="container mt-4">
        {pendingRequests.map((request, index) => (
          <Card key={index} className="mb-3">
            <Card.Body>
              <Card.Title>Cliente: {request.name}</Card.Title>
              <Card.Text>Dirección: {request.address}</Card.Text>
              <Card.Text>Tiempo restante: {request.timer} segundos</Card.Text>
              <Button variant="primary" onClick={() => handleAccept(request, index)}>
                Aceptar Viaje
              </Button>
            </Card.Body>
          </Card>
        ))}
      </div>
    </>
  );
};

export default React.memo(MapComponent);
