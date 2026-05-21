import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import socket, { connectSocket, joinEventRoom, leaveEventRoom } from '../services/socket';
import CapacityGauge from '../components/CapacityGauge';

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyMsg, setBuyMsg] = useState('');

  useEffect(() => {
    api.get(`/events/${id}`)
      .then((res) => setEvent(res.data.event))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));

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
    try {
      setBuyMsg('Procesando compra...');
      const res = await api.post('/tickets/purchase', { event_id: Number(id) });
      navigate(`/my-tickets`);
    } catch (err) {
      setBuyMsg(err.response?.data?.error || 'Error al comprar');
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border" /></div>;
  if (!event) return <div className="container mt-4"><div className="alert alert-danger">Evento no encontrado</div></div>;

  const sold = event.sold || 0;
  const available = event.capacity - sold;

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8">
          <h2>{event.name}</h2>
          <p className="text-muted">
            {new Date(event.date).toLocaleDateString()} – {event.location}
          </p>
          <p>{event.description}</p>

          <h5 className="mt-4">Estado del aforo</h5>
          <CapacityGauge sold={sold} capacity={event.capacity} />
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h3 className="text-primary">${parseFloat(event.ticket_price).toFixed(2)}</h3>
              <p className={`badge bg-${available > 0 ? 'success' : 'danger'} fs-6`}>
                {available > 0 ? `${available} boletos disponibles` : 'Agotado'}
              </p>
              <button
                className="btn btn-primary w-100 btn-lg"
                disabled={available <= 0 || event.status !== 'published' || buyMsg}
                onClick={handleBuy}
              >
                {buyMsg || 'Comprar boleto'}
              </button>
            </div>
          </div>

          {tickets.length > 0 && (
            <div className="card mt-3">
              <div className="card-header">Boletos vendidos ({tickets.length})</div>
              <ul className="list-group list-group-flush" style={{ maxHeight: 300, overflowY: 'auto' }}>
                {tickets.map((t) => (
                  <li key={t.id} className="list-group-item d-flex justify-content-between align-items-center small">
                    <span>{t.buyer_name}</span>
                    <span className={`badge bg-${t.status === 'active' ? 'success' : t.status === 'used' ? 'secondary' : 'danger'}`}>{t.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
