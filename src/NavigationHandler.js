import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NavigationHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handlePopState = (event) => {
      const token = localStorage.getItem('token');
      if (token && location.pathname === '/') {
        navigate('/home');
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate, location]);

  return null; // Este componente no necesita renderizar nada
};

export default NavigationHandler;
