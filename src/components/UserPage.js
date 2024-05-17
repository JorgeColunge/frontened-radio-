import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';


function UserPage() {
    const [user, setUser] = useState({
        nombre: "",
        id: "",
        foto: null
    });

    useEffect(() => {
        const fetchUserData = async () => {
            const id_usuario = localStorage.getItem('id_usuario');
            if (id_usuario) {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/user/${id_usuario}`);
                    if (response.data) {
                        setUser(prevState => ({
                            ...prevState,
                            nombre: response.data.nombre,
                            id: response.data.id_usuario,
                            foto: response.data.foto || null
                        }));
                    }
                } catch (error) {
                    console.error('Error al obtener los datos del usuario:', error);
                    setUser(prevState => ({
                        ...prevState,
                        error: 'No se pudo cargar la información del usuario'
                    }));
                }
            }
        };

        fetchUserData();
    }, []);

    const backButtonStyle = {
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        zIndex: 1000
    };

    return (
        <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', backgroundColor: '#fff' }}>
            <h1 style={{ textAlign: 'center', color: '#333' }}>Perfil del Conductor</h1>
            <div style={{ margin: '20px 0', padding: '10px', borderBottom: '1px solid #eee' }}>
                <strong>ID:</strong> {user.id}
                <br />
                <strong>Nombre:</strong> {user.nombre}
                {user.error && <p>{user.error}</p>}
            </div>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                {user.foto && <img src={user.foto} alt="Foto del usuario" style={{ width: '150px', height: '150px', borderRadius: '75px', objectFit: 'cover', marginBottom: '20px' }} />}
            </div>
            <div style={backButtonStyle}>
                <Link to="/home" className="btn btn-secondary">
                    <FontAwesomeIcon icon={faArrowLeft} size="lg" />
                </Link>
            </div>
        </div>
    );
}

export default UserPage;
