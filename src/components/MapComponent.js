import React, { useState, useEffect, useRef} from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import axios from 'axios';
import socket from '../Socket';
import { Modal, Button } from 'react-bootstrap';

const containerStyle = {
  width: '800px',
  height: '800px'
};

const MapComponent = ({ id_usuario }) => {
  const [location, setLocation] = useState();
  const [marker, setMarker] = useState();
  const [googleMap, setGoogleMap] = useState(null);
  //const [directionsRenderer, setDirectionsRenderer] = useState(null); // Almacenar el DirectionsRenderer en el estado
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [showAssignedNotification, setShowAssignedNotification] = useState(false);
  const [clientInfo, setClientInfo] = useState({});
  const [showClientInfo, setShowClientInfo] = useState(false);


  const navigateToClient = () => {
    if (!clientInfo.latitud || !clientInfo.longitud || !clientInfo.latitud_fin || !clientInfo.longitud_fin) {
      console.error('La información de la ubicación del cliente o del destino no está completamente definida.');
      return;
    }

    // Prepara el punto de recogida como punto inicial de navegación
    const pickupLocation = `${clientInfo.latitud},${clientInfo.longitud}`;
    const finalDestination = `${clientInfo.latitud_fin},${clientInfo.longitud_fin}`;
    
    // Crear URL para iniciar navegación directamente desde la ubicación actual hasta el punto de recogida y luego al destino final
    const googleMapsNavigationUrl = `google.navigation:q=${finalDestination}&waypoints=${pickupLocation}`;

    // Abre la URL en un dispositivo móvil, esto debería iniciar la aplicación de Google Maps en modo de navegación
    window.open(googleMapsNavigationUrl, '_blank');
};


  const googleMapsUrl = () => {
    if (location && clientInfo) {
      return `https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d${calculateDistance(location.lat, location.lng, clientInfo.latitud, clientInfo.longitud)}!2d${location.lng}!3d${location.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e0!4m5!1s${location.lat},${location.lng}!2sMy%20Location!3m2!1d${location.lat}!2d${location.lng}!4m5!1s${clientInfo.latitud},${clientInfo.longitud}!2s${encodeURIComponent(clientInfo.direccion)}!3m2!1d${clientInfo.latitud}!2d${clientInfo.longitud}!5e0!3m2!1sen!2sus!4v${new Date().getTime()}`;
    }
    return '';
  };

  const snapToRoad = async (latitude, longitude) => {
    try {
      const response = await axios.get(`https://roads.googleapis.com/v1/nearestRoads?points=${latitude},${longitude}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`);
      if (response.data && response.data.snappedPoints.length > 0) {
        const { location } = response.data.snappedPoints[0];
        return { lat: location.latitude, lng: location.longitude };
      }
      return { lat: latitude, lng: longitude };
    } catch (error) {
      console.error("Error al ajustar a la vía:", error);
      return { lat: latitude, lng: longitude };
    }
  };

  function sendLocationToServer(latitude, longitude) {
    const payload = { id_usuario, latitude, longitude };
    axios.post(`${process.env.REACT_APP_API_URL}/api/geolocation/update-location`, payload)
      .then(response => {
        console.log("Respuesta del servidor:", response.data);
      })
      .catch(error => {
        console.error("Error al enviar la ubicación:", error);
      });
  }
  
  

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distancia en metros
  };

  const animateMarker = (marker, newPosition, duration) => {
    const start = marker.getPosition();
    const end = new window.google.maps.LatLng(newPosition.lat, newPosition.lng);
    const deltaLat = (end.lat() - start.lat()) / duration;
    const deltaLng = (end.lng() - start.lng()) / duration;

    let startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const currentLat = start.lat() + (deltaLat * progress);
      const currentLng = start.lng() + (deltaLng * progress);
      marker.setPosition(new window.google.maps.LatLng(currentLat, currentLng));

      if (progress < duration) {
        window.requestAnimationFrame(step);
      } else {
        marker.setPosition(end);
      }
    }

    window.requestAnimationFrame(step);
  };

  const handleAccept = async (request, index) => {
    console.log(`Enviando solicitud de aceptación del viaje con id_viaje: ${request.viajeId} y id_taxista: ${id_usuario}`);
    const acceptTaxiData = {
      id_viaje: request.viajeId,
      id_taxista: id_usuario
    };
  
    try {
      const response = await axios.post('${process.env.REACT_APP_API_URL}/api/geolocation/accept-taxi-request', acceptTaxiData);
      console.log('Respuesta de la aceptación del taxi:', response.data);
      setShowNotification(true); // Muestra la notificación de asignación
      setTimeout(() => {
        setShowNotification(false);
      }, 2000);
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

  useEffect(() => {
    if (googleMap && !directionsRenderer) {
      const renderer = new window.google.maps.DirectionsRenderer();
      renderer.setMap(googleMap);
      setDirectionsRenderer(renderer);
    }
  }, [googleMap]);

  useEffect(() => {
    if (location && clientInfo && showClientInfo) {
      // Asegúrate de crear una nueva instancia solo si no hay una existente
      if (!directionsRenderer) {
        const newDirectionsRenderer = new window.google.maps.DirectionsRenderer({
          map: googleMap,
          suppressMarkers: true,
        });
        setDirectionsRenderer(newDirectionsRenderer);
      } else {
        // Solo limpia la ruta anterior, no la instancia de DirectionsRenderer
        directionsRenderer.setMap(null);
        directionsRenderer.setMap(googleMap);
      }
  
      // Dibuja la nueva ruta.
      showRouteToClient(clientInfo.latitud, clientInfo.longitud, clientInfo.latitud_fin, clientInfo.longitud_fin);
    }
  }, [location, clientInfo, showClientInfo]);
  
  // Este useEffect se encarga de la limpieza y solo se ejecuta al desmontar el componente
  useEffect(() => {
    return () => {
      if (directionsRenderer) {
        directionsRenderer.setMap(null);
        // Aquí no es necesario establecer directionsRenderer a null porque el componente se está desmontando
      }
      // Aquí deberías también limpiar los sockets y otros recursos abiertos
    };
  }, []); // Las dependencias vacías aseguran que esto solo se ejecute al desmontar


  let markersArray = [];

const [directionsRenderer, setDirectionsRenderer] = useState(null);

const showRouteToClient = (clientLat, clientLng, clientLatDest, clientLngDest) => {
  clearMarkers();

  if (!directionsRenderer) {
    const newDirectionsRenderer = new window.google.maps.DirectionsRenderer({
      map: googleMap,
      suppressMarkers: true,
      preserveViewport: true,
    });
    setDirectionsRenderer(newDirectionsRenderer);
  }else {
    directionsRenderer.setOptions({
      suppressMarkers: true,
      preserveViewport: true, // Asegurarse de que preserveViewport esté activo en actualizaciones
    });
  }

  const directionsService = new window.google.maps.DirectionsService();
  const origin = new window.google.maps.LatLng(location.lat, location.lng);
  const stopover = new window.google.maps.LatLng(clientLat, clientLng);
  const finalDestination = new window.google.maps.LatLng(clientLatDest, clientLngDest);
  const request = {
    origin: origin,
    destination: finalDestination,
    waypoints: [{ location: stopover, stopover: true }],
    travelMode: window.google.maps.TravelMode.DRIVING
  };

  directionsService.route(request, (result, status) => {
    if (status === 'OK') {
      if (directionsRenderer && directionsRenderer.getMap()) {
        directionsRenderer.setDirections(result);
        addCustomMarker(stopover, '/imagenes/Map_pin_icon.svg.png', 'Cliente');
        addCustomMarker(finalDestination, '/imagenes/Map_pin_icon.svg.png', 'Destino Final');

        googleMap.setCenter(marker.getPosition()); // Esto centrará el mapa en el vehículo
        googleMap.setZoom(googleMap.getZoom()); // Esto mantendrá el zoom actual
      }
    } else {
      console.error('Error al cargar las direcciones:', status);
    }
  });
};

function addCustomMarker(position, iconUrl, title) {
  const marker = new window.google.maps.Marker({
    position: position,
    map: googleMap,
    icon: {
      url: iconUrl,
      scaledSize: new window.google.maps.Size(40, 40)
    },
    title: title
  });
  markersArray.push(marker);
}

function clearMarkers() {
  markersArray.forEach(marker => marker.setMap(null));
  markersArray = [];
}

useEffect(() => {
  const intervalRequestId = setInterval(() => {
    setPendingRequests((prevRequests) =>
      prevRequests
        .map((request) => ({ ...request, timer: request.timer - 1 }))
        .filter((request) => request.timer > 0)
    );
  }, 1000);

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
    showRouteToClient(data.latitud, data.longitud, data.latitud_fin, data.longitud_fin);
    setShowClientInfo(true);
    setClientInfo({
      nombre: data.nombre, telefono: data.telefono, direccion: data.direccion,
      latitud: data.latitud, longitud: data.longitud, direccion_fin: data.direccion_fin,
      latitud_fin: data.latitud_fin, longitud_fin: data.longitud_fin
    });
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
          if (distanceMoved >= 5 || !location) {
            setLocation(snappedPosition);
            await sendLocationToServer(snappedPosition.lat, snappedPosition.lng);

            if (marker) {
              animateMarker(marker, snappedPosition, 1000);
              googleMap.panTo(new window.google.maps.LatLng(snappedPosition.lat, snappedPosition.lng)); 
            } else {
              setMarker(createMarker(snappedPosition));
            }
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

    function createMarker(position) {
      return new window.google.maps.Marker({
        position: position,
        map: googleMap, // Asegúrate de que googleMap es el objeto mapa de Google Maps ya cargado
        icon: {
          url: '/imagenes/car_topview.svg', // Asegúrate de que la ruta a la imagen es correcta
          scaledSize: new window.google.maps.Size(40, 40) // Dimensiones del icono
        },
      });
    }
  
    const intervalId = setInterval(updateLocation, 5000);
  
    return () => {
      clearInterval(intervalId); // Limpiar el intervalo de actualización de ubicación
      clearInterval(intervalRequestId); // Limpiar el intervalo de solicitud pendiente
      socket.off('connect', handleConnect);
      socket.off('connect_error', handleConnectError);
      socket.off('taxiRequest', handleTaxiRequest);
      socket.off('taxiRequestAccepted', handleTaxiRequestAccepted);
      socket.off('assignedTaxi', handleAssignedTaxi);
    };
  }, [id_usuario, location, marker, googleMap, clientInfo, directionsRenderer]);
  

  return (
    <>
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={location || { lat: -3.745, lng: -38.523 }}
          zoom={20}
          onLoad={(map) => setGoogleMap(map)}
        />
      </LoadScript>

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
    </>
  );
};

export default React.memo(MapComponent);
