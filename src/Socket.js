// socket.js
import io from 'socket.io-client';
const socket = io('https://backend-k3yb.onrender.com/', { reconnection: true });
export default socket;