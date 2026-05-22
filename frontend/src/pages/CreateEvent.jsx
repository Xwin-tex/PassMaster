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
    status: 'published',
  });
  const [media, setMedia] = useState([]);
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addMedia = () => {
    if (!mediaUrl.trim()) return;
    const url = mediaUrl.trim();
    const type = url.match(/youtube\.com|youtu\.be/) ? 'video' : mediaType;
    setMedia([...media, { type, url }]);
    setMediaUrl('');
  };

  const removeMedia = (i) => setMedia(media.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = media.length > 0 ? { ...form, media } : form;
      const res = await api.post('/events', payload);
      navigate(`/events/${res.data.event.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear evento');
    }
  };

  return (
    <div className="fade-in">
      <div className="hero-section mb-4">
        <div className="container">
          <h1 className="display-5 fw-bold mb-2">Crear Evento</h1>
          <p className="text-white-50 mb-0">Publica un nuevo evento y vende boletos digitales</p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 600 }}>
        <div className="card p-4 fade-in-up">
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-medium">Nombre del evento</label>
              <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-medium">Descripción</label>
              <textarea className="form-control" name="description" rows="3" value={form.description} onChange={handleChange} />
            </div>
            <div className="row mb-3">
              <div className="col">
                <label className="form-label small fw-medium">Fecha y hora</label>
                <input className="form-control" type="datetime-local" name="date" value={form.date} onChange={handleChange} required />
              </div>
              <div className="col">
                <label className="form-label small fw-medium">Ubicación</label>
                <input className="form-control" name="location" value={form.location} onChange={handleChange} required />
              </div>
            </div>
            <div className="row mb-3">
              <div className="col">
                <label className="form-label small fw-medium">Capacidad</label>
                <input className="form-control" type="number" name="capacity" min="1" value={form.capacity} onChange={handleChange} required />
              </div>
              <div className="col">
                <label className="form-label small fw-medium">Precio del boleto ($)</label>
                <input className="form-control" type="number" step="0.01" name="ticket_price" min="0" value={form.ticket_price} onChange={handleChange} required />
              </div>
            </div>
            <div className="mb-4">
              <label className="form-label small fw-medium">Estado</label>
              <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                <option value="published">Publicado (visible para compras)</option>
                <option value="draft">Borrador (oculto)</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-medium">Fotos / Videos del evento</label>
              <div className="input-group mb-2">
                <select className="form-select" style={{ maxWidth: 110 }} value={mediaType} onChange={(e) => setMediaType(e.target.value)}>
                  <option value="image">Imagen</option>
                  <option value="video">Video</option>
                </select>
                <input className="form-control" placeholder="Pega la URL..." value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} />
                <button className="btn btn-outline-primary" type="button" onClick={addMedia}>+</button>
              </div>
              {media.length > 0 && (
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {media.map((m, i) => (
                    <div key={i} className="position-relative" style={{ width: 80, height: 80 }}>
                      {m.type === 'image' ? (
                        <img src={m.url} alt="" className="rounded" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.style.display = 'none'} />
                      ) : (
                        <div className="bg-dark rounded d-flex align-items-center justify-content-center text-white" style={{ width: '100%', height: '100%' }}>▶</div>
                      )}
                      <button className="btn btn-sm btn-danger position-absolute top-0 end-0 p-0 lh-1" style={{ fontSize: 10 }} onClick={() => removeMedia(i)}>x</button>
                    </div>
                  ))}
                </div>
              )}
              <small className="text-muted d-block mt-1">Pega URLs de imágenes o videos de YouTube</small>
            </div>
            <button className="btn btn-primary w-100" type="submit">Crear Evento</button>
          </form>
        </div>
      </div>
    </div>
  );
}
