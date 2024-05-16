import { useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

let googleMapScript;
let googleMap;
let markers = []; // Almacenar los marcadores
let socket;

const UsersMap = () => {
    const googleMapRef = useRef();

    useEffect(() => {
        // Inicializar Socket.IO
        socket = io('https://backend-k3yb.onrender.com');

        socket.on('connect', () => {
            console.log('Conexión Socket.IO establecida');
        });

        socket.on('connect_error', (error) => {
            console.error('Error al conectar a Socket.IO:', error);
        });

        // Escuchar actualizaciones de ubicación
        socket.on('locationUpdated', (updatedLocations) => {
            console.log('Ubicaciones actualizadas:', updatedLocations);
            updateMarkers(updatedLocations);
        });

        // Agregar el script de Google Maps
        if (!document.querySelector('#google-maps-script')) {
            googleMapScript = document.createElement('script');
            googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
            googleMapScript.async = true;
            googleMapScript.defer = true;
            googleMapScript.id = 'google-maps-script';
            window.document.body.appendChild(googleMapScript);
            window.initMap = initializeGoogleMap;
        } else {
            if (!window.google) {
                window.initMap = initializeGoogleMap;
            } else {
                initializeGoogleMap();
            }
        }

        return () => {
            socket.disconnect(); // Desconectar Socket.IO al desmontar el componente
        };
    }, []);

    const initializeGoogleMap = () => {
        googleMap = new window.google.maps.Map(googleMapRef.current, {
            center: { lat: -34.397, lng: 150.644 },
            zoom: 15,
        });

        fetchUserLocations();
    };

    const fetchUserLocations = async () => {
        try {
            const response = await axios.get('https://backend-k3yb.onrender.com/api/geolocation/users');
            updateMarkers(response.data);
        } catch (error) {
            console.error("Error fetching user locations: ", error);
        }
    };

    const updateMarkers = (location) => {
        const { id_usuario, latitude, longitude } = location;
    
        // Buscar si ya existe un marcador para este usuario
        let marker = markers.find(marker => marker.id_usuario === id_usuario);
    
        if (marker) {
            // Si el marcador ya existe, actualizar su posición
            marker.setPosition(new window.google.maps.LatLng(latitude, longitude));
        } else {
            // Si el marcador no existe, crear uno nuevo y añadirlo al mapa
            marker = new window.google.maps.Marker({
                position: { lat: latitude, lng: longitude },
                map: googleMap,
            });
            marker.id_usuario = id_usuario; // Guardar el id del usuario en el marcador para futuras referencias
            markers.push(marker); // Añadir el marcador al arreglo de marcadores
        }
    };
        

    return <div ref={googleMapRef} style={{ height: '500px', width: '100%' }} />;
};
 
  export default UsersMap;



  
