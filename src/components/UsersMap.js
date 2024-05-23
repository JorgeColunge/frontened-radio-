import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import socket from '../Socket';

let markers = {}; // Almacenar los marcadores
let pendingRequests = {}; // Almacenar las solicitudes pendientes

const UsersMap = () => {
    const mapRef = useRef();
    const mapInstance = useRef(null);
    const [runningAnimations, setRunningAnimations] = useState({}); // Para almacenar el estado de las animaciones

    useEffect(() => {
        socket.on('connect', () => {
            console.log('Conexión Socket.IO establecida');
        });

        socket.on('connect_error', (error) => {
            console.error('Error al conectar a Socket.IO:', error);
        });

        // Escuchar actualizaciones de ubicación
        socket.on('locationUpdated', (updatedLocation) => {
            console.log('Ubicaciones actualizadas:', updatedLocation);
            if (Array.isArray(updatedLocation)) {
                updatedLocation.forEach(location => updateMarkers(location));
            } else {
                updateMarkers(updatedLocation);
            }
        });

        // Escuchar solicitudes de taxi pendientes
        socket.on('taxiRequestPending', ({ latitude, longitude, range, viajeId }) => {
            console.log('solicitud en curso', latitude, longitude);
            clearPendingRequestAnimation(viajeId); // Limpiar cualquier animación previa
            showPendingRequestAnimation(latitude, longitude, range, viajeId, 'taxi');
        });

        // Escuchar aceptación de solicitud de taxi
        socket.on('taxiRequestAccepted', ({ latitude, longitude, viajeId }) => {
            console.log('solicitud aceptada');
            changeRequestAnimationColor(viajeId, 'green', '#0f0'); // Cambiar color a verde
            showAcceptedRequestMarker(latitude, longitude, viajeId);
            setTimeout(() => clearPendingRequestAnimation(viajeId), 1000); // Mantener la animación 1 segundo adicional
        });

        // Escuchar rechazo de solicitud de taxi
        socket.on('taxiRequestRejected', ({ id_viaje, latitude, longitude }) => {
            console.log('solicitud rechazada');
            changeRequestAnimationColor(id_viaje, 'red', '#f00'); // Cambiar color a rojo
            showRejectedRequestMarker(latitude, longitude, id_viaje);
            setTimeout(() => clearPendingRequestAnimation(id_viaje), 1000); // Mantener la animación 1 segundo adicional
        });

        // Escuchar solicitudes de delivery pendientes
        socket.on('deliveryRequestPending', ({ latitude, longitude, range, viajeId }) => {
            console.log('solicitud de delivery en curso', latitude, longitude);
            clearPendingRequestAnimation(viajeId); // Limpiar cualquier animación previa
            showPendingRequestAnimation(latitude, longitude, range, viajeId, 'delivery');
        });

        // Escuchar aceptación de solicitud de delivery
        socket.on('deliveryRequestAccepted', ({ latitude, longitude, viajeId }) => {
            console.log('solicitud de delivery aceptada');
            changeRequestAnimationColor(viajeId, 'green', '#0f0'); // Cambiar color a verde
            showAcceptedRequestMarker(latitude, longitude, viajeId);
            setTimeout(() => clearPendingRequestAnimation(viajeId), 1000); // Mantener la animación 1 segundo adicional
        });

        // Escuchar rechazo de solicitud de delivery
        socket.on('deliveryRequestRejected', ({ id_viaje, latitude, longitude }) => {
            console.log('solicitud de delivery rechazada');
            changeRequestAnimationColor(id_viaje, 'red', '#f00'); // Cambiar color a rojo
            showRejectedRequestMarker(latitude, longitude, id_viaje);
            setTimeout(() => clearPendingRequestAnimation(id_viaje), 1000); // Mantener la animación 1 segundo adicional
        });

        // Escuchar solicitudes de reserva pendientes
        socket.on('reservationRequestPending', ({ latitude, longitude, range, viajeId }) => {
            console.log('solicitud de reserva en curso', latitude, longitude);
            clearPendingRequestAnimation(viajeId); // Limpiar cualquier animación previa
            showPendingRequestAnimation(latitude, longitude, range, viajeId, 'reserva');
        });

        // Escuchar aceptación de solicitud de reserva
        socket.on('reservationRequestAccepted', ({ latitude, longitude, viajeId }) => {
            console.log('solicitud de reserva aceptada');
            changeRequestAnimationColor(viajeId, 'green', '#0f0'); // Cambiar color a verde
            showAcceptedRequestMarker(latitude, longitude, viajeId);
            setTimeout(() => clearPendingRequestAnimation(viajeId), 1000); // Mantener la animación 1 segundo adicional
        });

        // Escuchar rechazo de solicitud de reserva
        socket.on('reservationRequestRejected', ({ id_viaje, latitude, longitude }) => {
            console.log('solicitud de reserva rechazada');
            changeRequestAnimationColor(id_viaje, 'red', '#f00'); // Cambiar color a rojo
            showRejectedRequestMarker(latitude, longitude, id_viaje);
            setTimeout(() => clearPendingRequestAnimation(id_viaje), 1000); // Mantener la animación 1 segundo adicional
        });

        // Inicializar el mapa solo si aún no ha sido inicializado
        if (!mapInstance.current) {
            mapInstance.current = L.map(mapRef.current).setView([1.2146412737375492, -77.27825044479697], 15);

            // Añadir capa de OpenStreetMap
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapInstance.current);

            // Fetch initial user locations
            fetchUserLocations();
        }

        return () => {
            if (socket) {
                socket.disconnect(); // Desconectar Socket.IO al desmontar el componente
            }
        };
    }, []);

    const fetchUserLocations = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/geolocation/users`);
            response.data.forEach(location => updateMarkers(location));
        } catch (error) {
            console.error("Error fetching user locations: ", error);
        }
    };

    const updateMarkers = (location) => {
        const { id_usuario, latitude, longitude } = location;
        console.log('Actualizando marcador para:', id_usuario, latitude, longitude);

        if (typeof latitude !== 'number' || typeof longitude !== 'number') {
            console.error('Latitud o longitud no son números:', latitude, longitude);
            return;
        }

        if (markers[id_usuario]) {
            markers[id_usuario].setLatLng([latitude, longitude]);
        } else {
            const marker = L.marker([latitude, longitude], {
                icon: L.icon({
                    iconUrl: '/imagenes/car_topview.svg',
                    iconSize: [40, 40],
                    iconAnchor: [20, 20],
                })
            }).addTo(mapInstance.current);
            markers[id_usuario] = marker;
        }
    };

    const clearPendingRequestAnimation = (viajeId) => {
        if (pendingRequests[viajeId]) {
            if (pendingRequests[viajeId].interval) {
                clearInterval(pendingRequests[viajeId].interval);
            }
            mapInstance.current.removeLayer(pendingRequests[viajeId].circle);
            delete pendingRequests[viajeId];
            setRunningAnimations(prev => ({ ...prev, [viajeId]: false }));
        }
    };

    const changeRequestAnimationColor = (viajeId, color, fillColor) => {
        if (pendingRequests[viajeId]) {
            pendingRequests[viajeId].circle.setStyle({
                color: fillColor,
                fillColor: fillColor
            });
        }
    };

    const showPendingRequestAnimation = (latitude, longitude, range, viajeId, tipo) => {
        clearPendingRequestAnimation(viajeId);
      
        const animationRange = tipo === 'reserva' ? 100 : range; // Ajustar el rango de la animación para reservas
      
        const circle = L.circle([latitude, longitude], {
          color: tipo === 'reserva' ? '#ffa500' : '#30f',
          fillColor: tipo === 'reserva' ? '#ffa500' : '#30f',
          fillOpacity: 0.5,
          radius: 0
        }).addTo(mapInstance.current);
      
        const interval = setInterval(async () => {
          let currentRadius = 0;
          const animation = setInterval(() => {
            currentRadius += animationRange / 10; // Hacer la animación más grande para reservas
            if (currentRadius >= animationRange) {
              currentRadius = 0;
            }
            circle.setRadius(currentRadius);
          }, 50);
      
          try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/geolocation/check-status/${viajeId}`);
            if (response.data.estado !== 'pendiente') {
              clearInterval(animation);
              setTimeout(() => clearPendingRequestAnimation(viajeId), 500);
            }
          } catch (error) {
            console.error("Error checking request status: ", error);
          }
        }, tipo === 'reserva' ? 5 * 60 * 1000 : 1000);
      
        pendingRequests[viajeId] = { circle, interval };
        setRunningAnimations(prev => ({ ...prev, [viajeId]: true }));
      };

    const showAcceptedRequestMarker = (latitude, longitude, viajeId) => {
        const marker = L.circle([latitude, longitude], {
            color: 'green',
            fillColor: '#0f0',
            fillOpacity: 0.5,
            radius: 50
        }).addTo(mapInstance.current);

        setTimeout(() => {
            mapInstance.current.removeLayer(marker);
        }, 3000);
    };

    const showRejectedRequestMarker = (latitude, longitude, viajeId) => {
        const marker = L.circle([latitude, longitude], {
            color: 'red',
            fillColor: '#f00',
            fillOpacity: 0.5,
            radius: 50
        }).addTo(mapInstance.current);

        setTimeout(() => {
            mapInstance.current.removeLayer(marker);
        }, 3000);
    };

    return <div ref={mapRef} style={{ height: '500px', width: '100%' }} />;
};

export default UsersMap;
