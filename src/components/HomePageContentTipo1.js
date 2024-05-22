import React, { useEffect } from 'react';
import UsersMap from './UsersMap';
import socket from '../Socket';
import TaxiRequestForm from './TaxiRequestForm'; // Importa el formulario de solicitud de taxi

const HomePageContentTipo1 = () => {

  useEffect(() => {
    console.log('Socket conectado en HomePage:', socket.connected);
  }, []);

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-7">
          <UsersMap />
        </div>
        <div className="col-md-5">
          <TaxiRequestForm />
        </div>
      </div>
    </div>
  );
};

export default HomePageContentTipo1;
