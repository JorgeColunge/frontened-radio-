// src/components/UsersMap.js
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

        // Escuchar evento de pánico
        socket.on('panic_event', ({ id_usuario }) => {
            console.log('Panic event received for user:', id_usuario);
            showPanicMarker(id_usuario);
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
                socket.off('locationUpdated');
                socket.off('panic_event');
                socket.off('taxiRequestPending');
                socket.off('taxiRequestAccepted');
                socket.off('taxiRequestRejected');
                socket.off('deliveryRequestPending');
                socket.off('deliveryRequestAccepted');
                socket.off('deliveryRequestRejected');
                socket.off('reservationRequestPending');
                socket.off('reservationRequestAccepted');
                socket.off('reservationRequestRejected');
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

    const fetchDriverInfo = async (id_usuario) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/geolocation/driver-data/${id_usuario}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching driver info: ", error);
            return {};
        }
    };

    const fetchTripInfo = async (id_viaje) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/geolocation/trip-info/${id_viaje}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching trip info: ", error);
            return {};
        }
    };

    const updateMarkers = async (location) => {
        const { id_usuario, latitude, longitude } = location;
        console.log('Actualizando marcador para:', id_usuario, latitude, longitude);

        if (typeof latitude !== 'number' || typeof longitude !== 'number') {
            console.error('Latitud o longitud no son números:', latitude, longitude);
            return;
        }

        const driverInfo = await fetchDriverInfo(id_usuario);

        if (markers[id_usuario]) {
            markers[id_usuario].setLatLng([latitude, longitude]).bindPopup(`
                <strong>Taxi</strong><br />
                <strong>Nombre:</strong> ${driverInfo.nombre || 'N/A'}<br />
                <strong>Placa:</strong> ${driverInfo.placa || 'N/A'}<br />
                <strong>Teléfono:</strong> ${driverInfo.telefono || 'N/A'}<br />
                <strong>Navegación:</strong> ${driverInfo.navegacion || 'N/A'}
            `);
        } else {
            const marker = L.marker([latitude, longitude], {
                icon: L.icon({
                    iconUrl: '/imagenes/car_topview.svg',
                    iconSize: [40, 40],
                    iconAnchor: [20, 20],
                })
            }).addTo(mapInstance.current);

            marker.bindPopup(`
                <strong>Taxi</strong><br />
                <strong>Nombre:</strong> ${driverInfo.nombre || 'N/A'}<br />
                <strong>Placa:</strong> ${driverInfo.placa || 'N/A'}<br />
                <strong>Teléfono:</strong> ${driverInfo.telefono || 'N/A'}<br />
                <strong>Navegación:</strong> ${driverInfo.navegacion || 'N/A'}
            `);

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

    const showAcceptedRequestMarker = async (latitude, longitude, viajeId) => {
        const tripInfo = await fetchTripInfo(viajeId);

        const marker = L.marker([latitude, longitude], {
            icon: L.icon({
                iconUrl: '/imagenes/accepted_marker.svg',
                iconSize: [40, 40],
                iconAnchor: [20, 20],
            })
        }).addTo(mapInstance.current);

        marker.bindPopup(`
            <strong>Viaje Aceptado</strong><br />
            <strong>Nombre del Cliente:</strong> ${tripInfo.nombre || 'N/A'}<br />
            <strong>Teléfono:</strong> ${tripInfo.telefono || 'N/A'}<br />
            <strong>Dirección de Inicio:</strong> ${tripInfo.direccion || 'N/A'}<br />
            <strong>Dirección de Fin:</strong> ${tripInfo.direccion_fin || 'N/A'}
        `);

        setTimeout(() => {
            mapInstance.current.removeLayer(marker);
        }, 3000);
    };

    const showRejectedRequestMarker = async (latitude, longitude, viajeId) => {
        const tripInfo = await fetchTripInfo(viajeId);

        const marker = L.marker([latitude, longitude], {
            icon: L.icon({
                iconUrl: '/imagenes/rejected_marker.svg',
                iconSize: [40, 40],
                iconAnchor: [20, 20],
            })
        }).addTo(mapInstance.current);

        marker.bindPopup(`
            <strong>Viaje Rechazado</strong><br />
            <strong>Nombre del Cliente:</strong> ${tripInfo.nombre || 'N/A'}<br />
            <strong>Teléfono:</strong> ${tripInfo.telefono || 'N/A'}<br />
            <strong>Dirección de Inicio:</strong> ${tripInfo.direccion || 'N/A'}<br />
            <strong>Dirección de Fin:</strong> ${tripInfo.direccion_fin || 'N/A'}
        `);

        setTimeout(() => {
            mapInstance.current.removeLayer(marker);
        }, 3000);
    };

    const showPanicMarker = async (id_usuario) => {
        const driverInfo = await fetchDriverInfo(id_usuario);

        if (markers[id_usuario]) {
            const panicIcon = L.divIcon({
                html: `
                    <div style="position: relative;">
                        <img src="/imagenes/car_topview.svg" style="width: 40px; height: 40px;" />
                        <div style="position: absolute; top: 0; right: 0; background-color: red; border-radius: 50%; padding: 5px;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" class="bi bi-exclamation-circle-fill" viewBox="0 0 16 16">
                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM7.002 11a1 1 0 1 0 2 0 1 1 0 0 0-2 0zm.93-4.481-.082.38-.287 1.373-.008.042c-.07.34-.107.466-.154.54a.522.522 0 0 1-.212.21c-.098.057-.19.074-.492.074-.304 0-.397-.02-.498-.077a.517.517 0 0 1-.209-.2c-.051-.08-.084-.193-.159-.546l-.295-1.377-.076-.366C6.437 6.151 6.352 6 6 6c-.294 0-.529.216-.6.51l-.283 1.333-.08.376-.287 1.373-.076.366C5.352 10 5.437 10.151 6 10c.294 0 .529-.216.6-.51l.283-1.333.08-.376.287-1.373.076-.366c.071-.294.355-.51.65-.51.292 0 .55.216.63.51l.283 1.333.08.376.287 1.373.076.366c.071.294.355.51.65.51.292 0 .55-.216.63-.51l.283-1.333.08-.376.287-1.373.076-.366C10.563 6.151 10.478 6 10.002 6c-.294 0-.529.216-.6.51l-.283 1.333-.08.376-.287 1.373-.076.366C8.563 10 8.478 10.151 9 10c.294 0 .529-.216.6-.51l.283-1.333.08-.376.287-1.373.076-.366C9.563 6.151 9.478 6 9 6c-.294 0-.529.216-.6.51l-.283 1.333-.08.376-.287 1.373-.076.366C7.437 10 7.352 10.151 8 10c.294 0 .529-.216.6-.51l.283-1.333.08-.376.287-1.373.076-.366z"/>
                            </svg>
                        </div>
                    </div>
                `,
                className: '',
                iconSize: [40, 40],
                iconAnchor: [20, 20],
            });

            markers[id_usuario].setIcon(panicIcon).bindPopup(`
                <strong>Taxi (¡ALERTA!)</strong><br />
                <strong>Nombre:</strong> ${driverInfo.nombre || 'N/A'}<br />
                <strong>Placa:</strong> ${driverInfo.placa || 'N/A'}<br />
                <strong>Teléfono:</strong> ${driverInfo.telefono || 'N/A'}<br />
                <strong>Navegación:</strong> ${driverInfo.navegacion || 'N/A'}
            `).openPopup();
        }
    };

    return <div ref={mapRef} style={{ height: '500px', width: '100%' }} />;
};

export default UsersMap;
