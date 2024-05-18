import React from 'react';
import { Link } from 'react-router-dom';
import { Person, People, ChatDots, Globe, Calendar, FileText } from 'react-bootstrap-icons';
import HomePageContentTipo1 from './components/HomePageContentTipo1';
import HomePageContentTipo2 from './components/HomePageContentTipo2';
import LogoutButton from './components/LogoutButton'; // Asegúrate de tener este componente

const HomePage = () => {
  const tipoUsuario = localStorage.getItem('tipo_usuario');

  return (
    <div className="container-fluid">
      <div className="row align-items-center justify-content-between" style={{ padding: '20px' }}>
                <div className="col-auto">
                    <Link to="/home">
                    <img src={"/imagenes/Logo.jpg"} alt="Logo" style={{ width: '250px', marginRight: '20px' }} />
                    </Link>
                </div>
                <div className="col-auto d-flex align-items-center">
                    <Link to="/user" className="btn btn-link text-dark">
                    <Person size={30} />
                    </Link>
                    {tipoUsuario === 'tipo1' && (
                    <>
                        <Link to="/users-list" className="btn btn-link text-dark ml-2">
                        <People size={30} />
                        </Link>
                        <Link to="/chat" className="btn btn-link text-dark ml-2">
                        <ChatDots size={30} />
                        </Link>
                        <Link to="/historial-viajes" className="btn btn-link text-dark ml-2">
                        <Calendar size={30} />
                        </Link>
                    </>
                    )}
                    {tipoUsuario === 'tipo2' && (
                    <Link to="/historial-mis-viajes" className="btn btn-link text-dark ml-2">
                        <FileText size={30} />
                    </Link>
                    )}
                    <LogoutButton className="btn btn-warning ml-2" />
                </div>
            </div>
      {tipoUsuario === 'tipo1' ? <HomePageContentTipo1 /> : <HomePageContentTipo2 />}
    </div>
  );
};

export default HomePage;
