const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const Transaction = require('../models/Transaction');
const { generateUniqueCode } = require('../utils/generateCode');

exports.purchase = async (req, res) => {
  try {
    const { event_id } = req.body;
    if (!event_id) return res.status(400).json({ error: 'event_id requerido' });

    const event = await Event.findById(event_id);
    if (!event) return res.status(404).json({ error: 'Evento no encontrado' });
    if (event.status !== 'published') {
      return res.status(400).json({ error: 'El evento no está disponible para la venta' });
    }

    const sold = await Event.getSoldCount(event_id);
    if (sold >= event.capacity) {
      return res.status(400).json({ error: 'El evento está agotado' });
    }

    const unique_code = generateUniqueCode();

    const ticketId = await Ticket.create({
      event_id,
      buyer_id: req.user.id,
      unique_code,
    });

    const ticket = await Ticket.findById(ticketId);

    await Transaction.create({
      ticket_id: ticketId,
      buyer_id: req.user.id,
      amount: event.ticket_price,
      payment_method: 'stripe',
      payment_status: 'pending',
      payment_id: null,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`event-${event_id}`).emit('capacity:update', {
        eventId: event_id,
        sold: sold + 1,
        capacity: event.capacity,
      });
    }

    res.status(201).json({ ticket });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al comprar ticket' });
  }
};

exports.myTickets = async (req, res) => {
  try {
    const tickets = await Ticket.findByBuyer(req.user.id);
    res.json({ tickets });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener tus tickets' });
  }
};

exports.validate = async (req, res) => {
  try {
    const { code } = req.params;
    if (!code) return res.status(400).json({ error: 'Código requerido' });

    const ticket = await Ticket.findByCode(code);
    if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado' });

    const event = await Event.findById(ticket.event_id);

    const result = {
      id: ticket.id,
      event_name: ticket.event_name,
      event_date: ticket.event_date,
      event_location: ticket.event_location,
      buyer_name: (await require('../models/User').findById(ticket.buyer_id))?.name,
      status: ticket.status,
      purchase_date: ticket.purchase_date,
    };

    res.json({ ticket: result });
  } catch (err) {
    res.status(500).json({ error: 'Error al validar ticket' });
  }
};

exports.checkIn = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Código requerido' });

    const ticket = await Ticket.findByCode(code);
    if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado' });

    if (ticket.status === 'used') {
      return res.status(400).json({
        error: 'Este ticket ya fue utilizado',
        checked_in_at: ticket.checked_in_at,
      });
    }

    if (ticket.status === 'cancelled' || ticket.status === 'refunded') {
      return res.status(400).json({ error: `El ticket está ${ticket.status}` });
    }

    await Ticket.checkIn(ticket.id, req.user.id);
    const updated = await Ticket.findById(ticket.id);

    const io = req.app.get('io');
    if (io) {
      io.to(`event-${ticket.event_id}`).emit('checkin:update', {
        ticketId: ticket.id,
        eventId: ticket.event_id,
        status: 'used',
      });
    }

    res.json({ ticket: updated, message: 'Check-in exitoso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al realizar check-in' });
  }
};

exports.eventTickets = async (req, res) => {
  try {
    const tickets = await Ticket.findByEvent(req.params.eventId);
    res.json({ tickets });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener tickets del evento' });
  }
};
