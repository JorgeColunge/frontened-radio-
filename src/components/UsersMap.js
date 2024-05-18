import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import io from 'socket.io-client';

let socket;
let markers = {}; // Almacenar los marcadores

const UsersMap = () => {
    const mapRef = useRef();
    const mapInstance = useRef(null);

    useEffect(() => {
        // Inicializar Socket.IO
        socket = io(`${process.env.REACT_APP_API_URL}`);

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

        // Verifica que latitud y longitud sean números
        if (typeof latitude !== 'number' || typeof longitude !== 'number') {
            console.error('Latitud o longitud no son números:', latitude, longitude);
            return;
        }

        if (markers[id_usuario]) {
            // Si el marcador ya existe, actualizar su posición
            markers[id_usuario].setLatLng([latitude, longitude]);
        } else {
            // Si el marcador no existe, crear uno nuevo y añadirlo al mapa
            const marker = L.marker([latitude, longitude], {
                icon: L.icon({
                    iconUrl: '/imagenes/car_topview.svg', // Asegúrate de que la ruta a la imagen es correcta
                    iconSize: [40, 40], // Dimensiones del icono
                    iconAnchor: [20, 20], // Anclar el icono al centro
                })
            }).addTo(mapInstance.current);
            markers[id_usuario] = marker; // Guardar el marcador en el diccionario de marcadores
        }
    };

    return <div ref={mapRef} style={{ height: '500px', width: '100%' }} />;
};

export default UsersMap;
