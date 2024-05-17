import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUsers, faTaxi, faGlobe } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import socket from './Socket';
import LogoutButton from './LogoutButton';
import RequestTaxiDriver from './components/App-driver/RequestTaxiDriver';
import { Modal, Button } from 'react-bootstrap';

const HomePage = () => {
  const id_usuario = localStorage.getItem('id_usuario');
  const tipo_usuario = localStorage.getItem('tipo_usuario');
  const googleMapRef = useRef(null);
  const [googleMap, setGoogleMap] = useState(null);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    socket.connect();

    if (tipo_usuario === 'tipo2') {
      navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          socket.emit('updateLocation', { id_usuario, latitude, longitude });
        },
        (error) => {
          console.error('Error getting location:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else if (tipo_usuario === 'tipo1') {
      socket.on('locationUpdated', (location) => {
        updateMarkers(location);
      });
    }

    return () => {
      socket.disconnect();
    };
  }, [id_usuario, tipo_usuario]);

  useEffect(() => {
    if (tipo_usuario === 'tipo1') {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;
      window.initMap = initializeGoogleMap;
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, [tipo_usuario]);

  const initializeGoogleMap = () => {
    const map = new window.google.maps.Map(googleMapRef.current, {
      center: { lat: -34.397, lng: 150.644 },
      zoom: 15,
    });
    setGoogleMap(map);
    fetchUserLocations(map);
  };

  const fetchUserLocations = async (map) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/geolocation/users`);
      updateMarkers(response.data, map);
    } catch (error) {
      console.error('Error fetching user locations:', error);
    }
  };

  const updateMarkers = (location, map = googleMap) => {
    const { id_usuario, latitude, longitude } = location;

    let marker = markers.find((marker) => marker.id_usuario === id_usuario);

    if (marker) {
      marker.setPosition(new window.google.maps.LatLng(latitude, longitude));
    } else {
      marker = new window.google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: map,
        icon: {
          url: '/imagenes/car_topview.svg',
          scaledSize: new window.google.maps.Size(40, 40),
        },
      });
      marker.id_usuario = id_usuario;
      setMarkers((prevMarkers) => [...prevMarkers, marker]);
    }
  };

  const renderContentByUserType = () => {
    if (tipo_usuario === 'tipo1') {
      return (
        <div className="row">
          <div className="col-md-12" style={{ height: '85vh' }}>
            <div ref={googleMapRef} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>
      );
    } else if (tipo_usuario === 'tipo2') {
      return (
        <div className="row">
          <div className="col-md-12">
            <h2>Solicitudes de Taxi</h2>
            <RequestTaxiDriver />
          </div>
        </div>
      );
    } else {
      return <p>Tipo de usuario no reconocido.</p>;
    }
  };

  return (
    <div className="container-fluid" style={{ height: '100vh' }}>
      <div className="row align-items-center" style={{ padding: '20px 0' }}>
        <div className="col text-center">
          <h1>Radio-taxis</h1>
        </div>
        <div className="col-auto" style={{ position: 'absolute', right: '20px', top: '20px' }}>
          <Link to="/user" className="btn btn-primary">
            <FontAwesomeIcon icon={faUser} size="lg" />
          </Link>
          <Link to="/users-list" className="btn btn-secondary ml-2">
            <FontAwesomeIcon icon={faUsers} size="lg" />
          </Link>
          <Link to="/chat" className="btn btn-success ml-2">
            <FontAwesomeIcon icon={faTaxi} />
          </Link>
          <Link to="/map" className="btn btn-success ml-2">
            <FontAwesomeIcon icon={faGlobe} />
          </Link>
          <LogoutButton />
        </div>
      </div>
      {renderContentByUserType()}
    </div>
  );
};

export default HomePage;
