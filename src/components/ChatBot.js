import React from 'react';

function ChatBot() {
  return (
    <div style={{ display: 'flex', height: '90vh', width: '100%' }}>
      {/* Panel de conversaciones */}
      <div style={{
        flex: 1,
        borderRight: '1px solid #ccc',
        overflowY: 'auto',
        padding: '10px',
        height: '100%'
      }}>
        <h3 style={{ textAlign: 'center' }}>Radio-taxis</h3>
        {/* Lista simulada de conversaciones */}
        <div style={{ padding: '10px', borderBottom: '1px solid #ccc', display: 'flex', alignItems: 'center' }}>
          <img src="avatar1.jpg" alt="Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }} />
          <div>
            <div style={{ fontWeight: 'bold' }}>Contacto 1</div>
            <div style={{ color: 'gray' }}>Último mensaje enviado</div>
          </div>
        </div>
        <div style={{ padding: '10px', borderBottom: '1px solid #ccc', display: 'flex', alignItems: 'center' }}>
          <img src="avatar2.jpg" alt="Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }} />
          <div>
            <div style={{ fontWeight: 'bold' }}>Contacto 2</div>
            <div style={{ color: 'gray' }}>Último mensaje enviado</div>
          </div>
        </div>
        <div style={{ padding: '10px', borderBottom: '1px solid #ccc', display: 'flex', alignItems: 'center' }}>
          <img src="avatar3.jpg" alt="Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }} />
          <div>
            <div style={{ fontWeight: 'bold' }}>Contacto 3</div>
            <div style={{ color: 'gray' }}>Último mensaje enviado</div>
          </div>
        </div>
      </div>
      
      {/* Panel de chat */}
      <div style={{
        flex: 2,
        display: 'flex',
        flexDirection: 'column',
        padding: '10px'
      }}>
        <h3 style={{ textAlign: 'center' }}>Chat</h3>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {/* Mensajes simulados */}
          <div style={{ margin: '10px', textAlign: 'left', backgroundColor: '#f1f0f0', padding: '8px', borderRadius: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>Remitente:</span> Hola, ¿cómo estás?
          </div>
          <div style={{ margin: '10px', textAlign: 'right', backgroundColor: '#d4e7fe', padding: '8px', borderRadius: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>Destinatario:</span> Bien, ¿y tú?
          </div>
          <div style={{ margin: '10px', textAlign: 'left', backgroundColor: '#f1f0f0', padding: '8px', borderRadius: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>Remitente:</span> ¡Todo bien gracias!
          </div>
        </div>
        <div style={{ display: 'flex', borderTop: '1px solid #ccc', marginTop: 'auto' }}>
          <input style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ccc' }} placeholder="Escribe un mensaje..." />
          <button style={{ width: '100px', borderRadius: '20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', marginLeft: '10px' }}>Enviar</button>
        </div>
      </div>
    </div>
  );
}

export default ChatBot;
