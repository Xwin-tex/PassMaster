function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log(`Cliente conectado: ${socket.id}`);

    socket.on('event:join', (eventId) => {
      socket.join(`event-${eventId}`);
      console.log(`Socket ${socket.id} unido a event-${eventId}`);
    });

    socket.on('event:leave', (eventId) => {
      socket.leave(`event-${eventId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Cliente desconectado: ${socket.id}`);
    });
  });
}

module.exports = { setupSocket };
