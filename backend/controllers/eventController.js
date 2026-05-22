const Event = require('../models/Event');
const Ticket = require('../models/Ticket');

exports.create = async (req, res) => {
  try {
    const { name, description, date, location, capacity, ticket_price, media } = req.body;
    if (!name || !date || !location || !capacity || !ticket_price) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const id = await Event.create({
      organizer_id: req.user.id,
      name,
      description,
      date,
      location,
      capacity: parseInt(capacity),
      ticket_price: parseFloat(ticket_price),
      media,
    });

    const event = await Event.findById(id);
    res.status(201).json({ event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear evento' });
  }
};

exports.list = async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.user?.role === 'organizer') filters.organizer_id = req.user.id;
    if (req.query.search) filters.search = req.query.search;

    const events = await Event.findAll(filters);

    const withSold = await Promise.all(
      events.map(async (e) => ({
        ...e,
        sold: await Event.getSoldCount(e.id),
      }))
    );

    res.json({ events: withSold });
  } catch (err) {
    res.status(500).json({ error: 'Error al listar eventos' });
  }
};

exports.getById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Evento no encontrado' });

    const sold = await Event.getSoldCount(event.id);
    res.json({ event: { ...event, sold } });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener evento' });
  }
};

exports.update = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Evento no encontrado' });
    if (event.organizer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }

    await Event.update(req.params.id, req.body);
    const updated = await Event.findById(req.params.id);
    res.json({ event: updated });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar evento' });
  }
};

exports.updateMedia = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Evento no encontrado' });
    if (event.organizer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const { media } = req.body;
    await Event.update(req.params.id, { media });
    res.json({ media });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar media' });
  }
};

exports.getTickets = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Evento no encontrado' });

    const tickets = await Ticket.findByEvent(req.params.id);
    res.json({ tickets });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener tickets' });
  }
};
