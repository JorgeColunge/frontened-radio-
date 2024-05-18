import React, { useState } from 'react';
import axios from 'axios';
import Select, { components } from 'react-select';
import countryData from './CountryData';
import Flag from 'react-world-flags';

const TaxiRequestForm = () => {
  const [countryCode, setCountryCode] = useState({ label: '57', value: '57', flag: 'CO' }); // Código de país por defecto para Colombia
  const [number, setNumber] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [message, setMessage] = useState('');

  const handleRequestTaxi = async (e) => {
    e.preventDefault();

    const clientId = countryCode.value + number; // Concatenar el código de país y el número

    try {
      // Convertir las direcciones en coordenadas usando la API de Google Maps Geocoding
      const startCoords = await getCoordinates(address);
      const endCoords = await getCoordinates(endAddress);

      const taxiRequestData = {
        clientId,
        name,
        latitude: startCoords.lat,
        longitude: startCoords.lng,
        address,
        endLatitude: endCoords.lat,
        endLongitude: endCoords.lng,
        endAddress
      };

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/geolocation/taxi-request`, taxiRequestData);
      setMessage('Solicitud de taxi enviada exitosamente.');
      console.log('Respuesta de la solicitud de taxi:', response.data);
    } catch (error) {
      setMessage('Error al solicitar el taxi.');
      console.error('Error al solicitar el taxi:', error);
    }
  };

  const getCoordinates = async (address) => {
    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
        params: {
          address: address,
          key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
        }
      });
      const { lat, lng } = response.data.results[0].geometry.location;
      return { lat, lng };
    } catch (error) {
      console.error('Error al convertir la dirección en coordenadas:', error);
      throw error;
    }
  };

  const countryOptions = countryData.map((country) => ({
    label: `${country.dial_code}`,
    value: country.dial_code,
    flag: country.flag
  }));

  const customSingleValue = ({ data }) => (
    <div className="custom-single-value d-flex align-items-center">
      <Flag code={data.flag} style={{ width: 20, marginRight: 10 }} />
      <span>{data.label}</span>
    </div>
  );

  const customOption = (props) => {
    return (
      <components.Option {...props}>
        <div className="d-flex align-items-center">
          <Flag code={props.data.flag} style={{ width: 20, marginRight: 10 }} />
          <span style={{ fontSize: '0.8em' }}>{props.data.label}</span>
        </div>
      </components.Option>
    );
  };

  const customStyles = {
    control: (base) => ({
      ...base,
      minHeight: '38px', // Ajusta la altura del Select
      height: '38px',
      borderRadius: '4px 0 0 4px',
      display: 'flex',
      alignItems: 'center',
    }),
    valueContainer: (base) => ({
      ...base,
      height: '38px',
      padding: '0 8px',
      display: 'flex',
      alignItems: 'center',
    }),
    singleValue: (base) => ({
      ...base,
      display: 'flex',
      alignItems: 'center',
      fontSize: '0.9em',
    }),
    input: (base) => ({
      ...base,
      margin: 0,
      padding: 0,
    }),
    indicatorsContainer: (base) => ({
      ...base,
      height: '38px',
    }),
  };

  return (
    <div className="card">
      <div className="card-body">
        <h2 className="card-title">Formulario de Solicitud de Taxi</h2>
        {message && <p className="alert alert-info">{message}</p>}
        <form onSubmit={handleRequestTaxi}>
          <div className="form-group">
            <label>Celular:</label>
            <div className="input-group">
              <div className="input-group-prepend">
                <Select
                  options={countryOptions}
                  value={countryCode}
                  onChange={setCountryCode}
                  className="form-control p-0"
                  classNamePrefix="select"
                  components={{ SingleValue: customSingleValue, Option: customOption }}
                  styles={customStyles}
                />
              </div>
              <input
                type="text"
                className="form-control"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                required
                style={{ borderRadius: '0 4px 4px 0' }}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Nombre:</label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ fontSize: '0.9em' }}
            />
          </div>
          <div className="form-group">
            <label>Dirección de Inicio:</label>
            <input
              type="text"
              className="form-control"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              style={{ fontSize: '0.9em' }}
            />
          </div>
          <div className="form-group">
            <label>Dirección de Destino:</label>
            <input
              type="text"
              className="form-control"
              value={endAddress}
              onChange={(e) => setEndAddress(e.target.value)}
              required
              style={{ fontSize: '0.9em' }}
            />
          </div>
          <br />
          <button type="submit" className="btn btn-warning btn-block" style={{ fontSize: '0.9em' }}>
            Solicitar Taxi
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaxiRequestForm;
