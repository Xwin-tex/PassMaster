import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import socket, { connectSocket, joinEventRoom, leaveEventRoom } from '../services/socket';
import CapacityGauge from '../components/CapacityGauge';
import PaymentModal from '../components/PaymentModal';

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyMsg, setBuyMsg] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [editMedia, setEditMedia] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('image');

  const loadEvent = useCallback(() => {
    api.get(`/events/${id}`)
      .then((res) => setEvent(res.data.event))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => {
    loadEvent();

    const s = connectSocket();
    joinEventRoom(id);

    const handleCapacity = (data) => {
      if (data.eventId === Number(id)) {
        setEvent((prev) => prev ? { ...prev, sold: data.sold } : prev);
      }
    };
    s.on('capacity:update', handleCapacity);

    return () => {
      leaveEventRoom(id);
      s.off('capacity:update', handleCapacity);
    };
  }, [id, navigate]);

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'organizer' || user.role === 'staff')) {
      api.get(`/events/${id}/tickets`).then((res) => setTickets(res.data.tickets)).catch(() => {});
    }
  }, [id, user]);

  const handleBuy = async () => {
    if (!user) return navigate('/login');
    setShowPayment(true);
  };

  const handlePaymentSuccess = async () => {
    setShowPayment(false);
    try {
      setBuyMsg('Generando boletos...');
      await api.post('/tickets/purchase', { event_id: Number(id), quantity });
      navigate('/my-tickets');
    } catch (err) {
      setBuyMsg(err.response?.data?.error || 'Error al comprar');
    }
  };

  const isOrganizer = user && (user.role === 'admin' || user.role === 'organizer');

  const handlePublish = async () => {
    try {
      const res = await api.put(`/events/${id}`, { status: 'published' });
      setEvent(res.data.event);
    } catch (err) {
      alert(err.response?.data?.error || 'Error al publicar');
    }
  };

  const addMediaItem = () => {
    if (!mediaUrl.trim()) return;
    const url = mediaUrl.trim();
    const type = url.match(/youtube\.com|youtu\.be/) ? 'video' : mediaType;
    const updated = [...(event.media || []), { type, url }];
    api.put(`/events/${id}/media`, { media: updated }).then((res) => {
      setEvent({ ...event, media: res.data.media });
      setMediaUrl('');
    }).catch((err) => alert(err.response?.data?.error || 'Error al agregar media'));
  };

  const removeMediaItem = (i) => {
    const updated = (event.media || []).filter((_, idx) => idx !== i);
    api.put(`/events/${id}/media`, { media: updated }).then((res) => {
      setEvent({ ...event, media: res.data.media });
    }).catch((err) => alert(err.response?.data?.error || 'Error al eliminar media'));
  };

  const isOwner = user && (user.id === event?.organizer_id || user.role === 'admin');

  if (loading) return <div className="text-center mt-5"><div className="spinner-border" role="status" /></div>;
  if (!event) return <div className="container mt-4"><div className="alert alert-danger">Evento no encontrado</div></div>;

  const sold = event.sold || 0;
  const available = event.capacity - sold;

  return (
    <div className="fade-in">
      <div className="hero-section mb-4">
        <div className="container">
          <span className="badge bg-white text-dark mb-2 slide-down">
            {event.status === 'published' ? '📢 Publicado' : '📝 Borrador'}
          </span>
          <h1 className="display-5 fw-bold mb-2 slide-down" style={{ animationDelay: '0.1s' }}>{event.name}</h1>
          <p className="text-white-50 mb-0 slide-down" style={{ animationDelay: '0.2s' }}>
            📅 {new Date(event.date).toLocaleDateString()} &nbsp;📍 {event.location}
          </p>
        </div>
      </div>

      <div className="container">
        <div className="row g-4">
          <div className="col-md-8">
            <div className="card p-4 fade-in-up">
              <div className="section-divider"></div>
              <h4>Acerca del evento</h4>
              <p className="text-muted">{event.description || 'Sin descripción'}</p>

              {event.media && event.media.length > 0 && (
                <div className="mt-4">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <h5 className="mb-0">Galería</h5>
                    {isOwner && (
                      <button className="btn btn-sm btn-outline-primary" onClick={() => setEditMedia(!editMedia)}>
                        {editMedia ? 'Listo' : 'Editar'}
                      </button>
                    )}
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    {event.media.map((m, i) => (
                      <div key={i} style={{ flex: '1 1 100%', maxWidth: '100%' }} className="position-relative">
                        {editMedia && (
                          <button className="btn btn-danger position-absolute top-0 end-0 m-2 z-1" onClick={() => removeMediaItem(i)}>Eliminar</button>
                        )}
                        {m.type === 'video' ? (
                          <div className="ratio ratio-16x9 rounded overflow-hidden">
                            <iframe src={m.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')} title={`media-${i}`} allowFullScreen />
                          </div>
                        ) : (
                          <a href={m.url} target="_blank" rel="noopener noreferrer">
                            <img src={m.url} alt="" className="rounded img-fluid" style={{ maxHeight: 250, objectFit: 'cover', width: '100%' }} onError={(e) => e.target.style.display = 'none'} />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isOwner && editMedia && (
                <div className="mt-3 p-3 bg-light rounded">
                  <label className="form-label small fw-medium">Agregar foto/video</label>
                  <div className="input-group">
                    <select className="form-select" style={{ maxWidth: 100 }} value={mediaType} onChange={(e) => setMediaType(e.target.value)}>
                      <option value="image">Imagen</option>
                      <option value="video">Video</option>
                    </select>
                    <input className="form-control" placeholder="Pega la URL..." value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} />
                    <button className="btn btn-primary" onClick={addMediaItem}>+</button>
                  </div>
                  <small className="text-muted d-block mt-1">Pega URLs de imágenes o videos de YouTube</small>
                </div>
              )}

              <h5 className="mt-4">📍 Ubicación</h5>
              <p className="text-muted">{event.location}</p>

              <h5 className="mt-4">📅 Fecha</h5>
              <p className="text-muted">{new Date(event.date).toLocaleString()}</p>

              <h5 className="mt-4">Aforo</h5>
              <CapacityGauge sold={sold} capacity={event.capacity} />
            </div>
          </div>

          <div className="col-md-4">
            <div className="card p-4 text-center fade-in-up" style={{ animationDelay: '0.2s' }}>
              <span className="badge bg-warning text-dark fs-6 mb-2">
                {event.status === 'published' ? '✅ Publicado' : '⏳ Borrador'}
              </span>
              <h2 className="fw-bold mb-2" style={{ color: 'var(--pm-primary)' }}>
                ${parseFloat(event.ticket_price).toFixed(2)}
              </h2>
              <p className={`badge bg-${available > 0 ? 'success' : 'danger'} fs-6 mb-3`}>
                {available > 0 ? `${available} boletos disponibles` : 'Agotado'}
              </p>

              {event.status === 'published' ? (
                <>
                  <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
                    <button className="btn btn-outline-secondary" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                    <span className="fw-bold fs-5" style={{ minWidth: 40, textAlign: 'center' }}>{quantity}</span>
                    <button className="btn btn-outline-secondary" onClick={() => setQuantity(Math.min(available, quantity + 1))}>+</button>
                    <small className="text-muted">boletos</small>
                  </div>
                  <div className="mb-3 small text-muted">Total: <strong>${(parseFloat(event.ticket_price) * quantity).toFixed(2)}</strong></div>
                  <button
                    className="btn btn-primary w-100 btn-lg"
                    disabled={available <= 0 || buyMsg}
                    onClick={handleBuy}
                  >
                    {buyMsg || '🎟️ Comprar boleto'}
                  </button>
                </>
              ) : isOrganizer && (
                <button className="btn btn-success w-100 btn-lg" onClick={handlePublish}>
                  📢 Publicar evento
                </button>
              )}

              <div className="progress mt-3" style={{ height: '8px' }}>
                <div className="progress-bar" style={{ width: `${event.capacity > 0 ? (sold / event.capacity) * 100 : 0}%` }} />
              </div>
              <small className="text-muted mt-1">{sold} de {event.capacity} vendidos</small>
            </div>

            {tickets.length > 0 && (
              <div className="card mt-3 fade-in-up" style={{ animationDelay: '0.3s' }}>
                <div className="card-header bg-transparent fw-bold">Boletos vendidos ({tickets.length})</div>
                <div className="list-group list-group-flush" style={{ maxHeight: 250, overflowY: 'auto' }}>
                  {tickets.map((t) => (
                    <div key={t.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <small className="fw-medium">{t.buyer_name}</small>
                        <small className="d-block text-muted">{t.buyer_email}</small>
                      </div>
                      <span className={`badge bg-${t.status === 'active' ? 'success' : t.status === 'used' ? 'secondary' : 'danger'}`}>
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <PaymentModal
        show={showPayment}
        total={parseFloat(event.ticket_price) * quantity}
        onClose={() => setShowPayment(false)}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
