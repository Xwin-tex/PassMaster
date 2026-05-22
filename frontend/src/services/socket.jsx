import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000', {
  autoConnect: false,
});

export function connectSocket() {
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
}

export function disconnectSocket() {
  if (socket.connected) {
    socket.disconnect();
  }
}

export function joinEventRoom(eventId) {
  socket.emit('event:join', eventId);
}

export function leaveEventRoom(eventId) {
  socket.emit('event:leave', eventId);
}

export default socket;
