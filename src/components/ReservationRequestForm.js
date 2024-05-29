import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select, { components } from 'react-select';
import countryData from './CountryData';
import Flag from 'react-world-flags';
import citiesByCountry from './CitiesByCountry';

const ReservationRequestForm = () => {
  const [phoneCountry, setPhoneCountry] = useState({ label: '57', value: '57', flag: 'CO' });
  const [startCountry, setStartCountry] = useState({ label: 'Colombia', value: 'CO', flag: 'CO' });
  const [endCountry, setEndCountry] = useState({ label: 'Colombia', value: 'CO', flag: 'CO' });
  const [startCity, setStartCity] = useState('Ipiales');
  const [endCity, setEndCity] = useState('Ipiales');
  const [address, setAddress] = useState('');
  const [number, setNumber] = useState('');
  const [name, setName] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [message, setMessage] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    setStartCity(citiesByCountry[startCountry.value][0]);
    setEndCity(citiesByCountry[endCountry.value][0]);
  }, [startCountry, endCountry]);

  const handleRequestReservation = async (e) => {
    e.preventDefault();
  
    const clientId = phoneCountry.value + number; // Concatenar el código de país y el número
    const fullStartAddress = `${address}, ${startCity}, ${startCountry.label}`;
    const fullEndAddress = `${endAddress}, ${endCity}, ${endCountry.label}`;
  
    try {
      // Convertir las direcciones en coordenadas usando la API de Google Maps Geocoding
      const startCoords = await getCoordinates(fullStartAddress);
      const endCoords = await getCoordinates(fullEndAddress);
  
      const reservationRequestData = {
        clientId,
        name,
        latitude: startCoords.lat,
        longitude: startCoords.lng,
        address: fullStartAddress,
        endLatitude: endCoords.lat,
        endLongitude: endCoords.lng,
        endAddress: fullEndAddress,
        fecha_reserva: date, // Asegúrate de que estos nombres coincidan con los utilizados en el servidor
        hora_reserva: time   // Asegúrate de que estos nombres coincidan con los utilizados en el servidor
      };
  
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/geolocation/reservation-request`, reservationRequestData);
      setMessage('Solicitud de reserva enviada exitosamente.');
      console.log('Respuesta de la solicitud de reserva:', response.data);
    } catch (error) {
      setMessage('Error al solicitar la reserva.');
      console.error('Error al solicitar la reserva:', error);
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
    label: `${country.name}`,
    value: country.code,
    flag: country.flag
  }));

  const phoneCountryOptions = countryData.map((country) => ({
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

  const startCityOptions = citiesByCountry[startCountry.value]?.map((city) => ({ label: city, value: city })) || [];
  const endCityOptions = citiesByCountry[endCountry.value]?.map((city) => ({ label: city, value: city })) || [];

  const customSingleValueFlagOnly = ({ data }) => (
    <Flag code={data.flag} style={{ width: 20 }} />
  );

  return (
    <div className="card">
      <div className="card-body">
        <h2 className="card-title">Solicitud de Reserva</h2>
        {message && <p className="alert alert-info">{message}</p>}
        <form onSubmit={handleRequestReservation}>
          <div className="form-group">
            <label>Celular:</label>
            <div className="input-group">
              <div className="input-group-prepend">
                <Select
                  options={phoneCountryOptions}
                  value={phoneCountry}
                  onChange={setPhoneCountry}
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
          <div className="form-row">
            <div className="form-group col-md-5">
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
            <div className="form-group col-md-4">
              <label>Ciudad:</label>
              <Select
                options={startCityOptions}
                value={{ label: startCity, value: startCity }}
                onChange={(selected) => setStartCity(selected.value)}
                className="form-control p-0"
                classNamePrefix="select"
                styles={customStyles}
              />
            </div>
            <div className="form-group col-md-3">
              <label>País:</label>
              <Select
                options={countryOptions}
                value={startCountry}
                onChange={setStartCountry}
                className="form-control p-0"
                classNamePrefix="select"
                components={{ SingleValue: customSingleValueFlagOnly, Option: customOption }}
                styles={customStyles}
              />
            </div>
            </div>
          <div className="form-row">
            <div className="form-group col-md-5">
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
            <div className="form-group col-md-4">
              <label>Ciudad:</label>
              <Select
                options={endCityOptions}
                value={{ label: endCity, value: endCity }}
                onChange={(selected) => setEndCity(selected.value)}
                className="form-control p-0"
                classNamePrefix="select"
                styles={customStyles}
              />
            </div>
            <div className="form-group col-md-3">
              <label>País:</label>
              <Select
                options={countryOptions}
                value={endCountry}
                onChange={setEndCountry}
                className="form-control p-0"
                classNamePrefix="select"
                components={{ SingleValue: customSingleValueFlagOnly, Option: customOption }}
                styles={customStyles}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group col-md-6">
              <label>Fecha del Viaje:</label>
              <input
                type="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                style={{ fontSize: '0.9em' }}
              />
            </div>
            <div className="form-group col-md-6">
              <label>Hora del Viaje:</label>
              <input
                type="time"
                className="form-control"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                style={{ fontSize: '0.9em' }}
              />
            </div>
          </div>
          <br />
          <button type="submit" className="btn btn-warning btn-block" style={{ fontSize: '0.9em' }}>
            Solicitar Reserva
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReservationRequestForm;
