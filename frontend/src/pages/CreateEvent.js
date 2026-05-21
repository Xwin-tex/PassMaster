import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function CreateEvent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    description: '',
    date: '',
    location: '',
    capacity: '',
    ticket_price: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/events', form);
      navigate(`/events/${res.data.event.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear evento');
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: 600 }}>
      <h2 className="mb-4">Crear Evento</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Nombre del evento</label>
          <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Descripción</label>
          <textarea className="form-control" name="description" rows="3" value={form.description} onChange={handleChange} />
        </div>
        <div className="row mb-3">
          <div className="col">
            <label className="form-label">Fecha y hora</label>
            <input className="form-control" type="datetime-local" name="date" value={form.date} onChange={handleChange} required />
          </div>
          <div className="col">
            <label className="form-label">Ubicación</label>
            <input className="form-control" name="location" value={form.location} onChange={handleChange} required />
          </div>
        </div>
        <div className="row mb-3">
          <div className="col">
            <label className="form-label">Capacidad</label>
            <input className="form-control" type="number" name="capacity" min="1" value={form.capacity} onChange={handleChange} required />
          </div>
          <div className="col">
            <label className="form-label">Precio del boleto ($)</label>
            <input className="form-control" type="number" step="0.01" name="ticket_price" min="0" value={form.ticket_price} onChange={handleChange} required />
          </div>
        </div>
        <button className="btn btn-primary w-100" type="submit">Crear Evento</button>
      </form>
    </div>
  );
}
