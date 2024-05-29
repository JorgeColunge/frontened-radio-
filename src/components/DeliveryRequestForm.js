import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select, { components } from 'react-select';
import countryData from './CountryData';
import Flag from 'react-world-flags';
import citiesByCountry from './CitiesByCountry';

const DeliveryRequestForm = () => {
  const [phoneCountry, setPhoneCountry] = useState({ label: '57', value: '57', flag: 'CO' });
  const [pickupCountry, setPickupCountry] = useState({ label: 'Colombia', value: 'CO', flag: 'CO' });
  const [deliveryCountry, setDeliveryCountry] = useState({ label: 'Colombia', value: 'CO', flag: 'CO' });
  const [pickupCity, setPickupCity] = useState('Ipiales');
  const [deliveryCity, setDeliveryCity] = useState('Ipiales');
  const [pickupAddress, setPickupAddress] = useState('');
  const [number, setNumber] = useState('');
  const [name, setName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setPickupCity(citiesByCountry[pickupCountry.value][0]);
    setDeliveryCity(citiesByCountry[deliveryCountry.value][0]);
  }, [pickupCountry, deliveryCountry]);

  const handleRequestDelivery = async (e) => {
    e.preventDefault();

    const clientId = phoneCountry.value + number; // Concatenar el código de país y el número
    const fullPickupAddress = `${pickupAddress}, ${pickupCity}, ${pickupCountry.label}`;
    const fullDeliveryAddress = `${deliveryAddress}, ${deliveryCity}, ${deliveryCountry.label}`;

    try {
      // Convertir las direcciones en coordenadas usando la API de Google Maps Geocoding
      const pickupCoords = await getCoordinates(fullPickupAddress);
      const deliveryCoords = await getCoordinates(fullDeliveryAddress);

      const deliveryRequestData = {
        clientId,
        name,
        latitude: pickupCoords.lat,
        longitude: pickupCoords.lng,
        pickupAddress: fullPickupAddress,
        deliveryLatitude: deliveryCoords.lat,
        deliveryLongitude: deliveryCoords.lng,
        deliveryAddress: fullDeliveryAddress,
        description
      };

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/geolocation/delivery-request`, deliveryRequestData);
      setMessage('Solicitud de domicilio enviada exitosamente.');
      console.log('Respuesta de la solicitud de domicilio:', response.data);
    } catch (error) {
      setMessage('Error al solicitar el domicilio.');
      console.error('Error al solicitar el domicilio:', error);
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

  const pickupCityOptions = citiesByCountry[pickupCountry.value]?.map((city) => ({ label: city, value: city })) || [];
  const deliveryCityOptions = citiesByCountry[deliveryCountry.value]?.map((city) => ({ label: city, value: city })) || [];

  const customSingleValueFlagOnly = ({ data }) => (
    <Flag code={data.flag} style={{ width: 20 }} />
  );

  return (
    <div className="card">
      <div className="card-body">
        <h2 className="card-title">Solicitud de Domicilio</h2>
        {message && <p className="alert alert-info">{message}</p>}
        <form onSubmit={handleRequestDelivery}>
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
              <label>Dirección de Recogida:</label>
              <input
                type="text"
                className="form-control"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                required
                style={{ fontSize: '0.9em' }}
              />
            </div>
            <div className="form-group col-md-4">
              <label>Ciudad:</label>
              <Select
                options={pickupCityOptions}
                value={{ label: pickupCity, value: pickupCity }}
                onChange={(selected) => setPickupCity(selected.value)}
                className="form-control p-0"
                classNamePrefix="select"
                styles={customStyles}
              />
            </div>
            <div className="form-group col-md-3">
              <label>País:</label>
              <Select
                options={countryOptions}
                value={pickupCountry}
                onChange={setPickupCountry}
                className="form-control p-0"
                classNamePrefix="select"
                components={{ SingleValue: customSingleValueFlagOnly, Option: customOption }}
                styles={customStyles}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group col-md-5">
              <label>Dirección de Entrega:</label>
              <input
                type="text"
                className="form-control"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                required
                style={{ fontSize: '0.9em' }}
              />
            </div>
            <div className="form-group col-md-4">
              <label>Ciudad:</label>
              <Select
                options={deliveryCityOptions}
                value={{ label: deliveryCity, value: deliveryCity }}
                onChange={(selected) => setDeliveryCity(selected.value)}
                className="form-control p-0"
                classNamePrefix="select"
                styles={customStyles}
              />
            </div>
            <div className="form-group col-md-3">
              <label>País:</label>
              <Select
                options={countryOptions}
                value={deliveryCountry}
                onChange={setDeliveryCountry}
                className="form-control p-0"
                classNamePrefix="select"
                components={{ SingleValue: customSingleValueFlagOnly, Option: customOption }}
                styles={customStyles}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Descripción del Domicilio:</label>
            <textarea
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              style={{ fontSize: '0.9em' }}
              rows="3"
            />
          </div>
          <br />
          <button type="submit" className="btn btn-warning btn-block" style={{ fontSize: '0.9em' }}>
            Solicitar Domicilio
          </button>
        </form>
      </div>
    </div>
  );
};

export default DeliveryRequestForm;
