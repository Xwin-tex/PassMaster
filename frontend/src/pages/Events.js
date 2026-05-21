import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Events() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api.get('/events?status=published')
      .then((res) => setEvents(res.data.events))
      .catch(() => {});
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Eventos Disponibles</h2>
      <div className="row g-3">
        {events.map((e) => {
          const sold = e.sold || 0;
          const pct = e.capacity > 0 ? Math.round((sold / e.capacity) * 100) : 0;
          const available = e.capacity - sold;

          return (
            <div key={e.id} className="col-md-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{e.name}</h5>
                  <p className="card-text text-muted small">
                    {new Date(e.date).toLocaleDateString()} – {e.location}
                  </p>
                  <p className="card-text">{e.description?.substring(0, 100)}</p>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold text-primary">${parseFloat(e.ticket_price).toFixed(2)}</span>
                    <span className={`badge bg-${available > 0 ? 'success' : 'danger'}`}>
                      {available > 0 ? `${available} disponibles` : 'Agotado'}
                    </span>
                  </div>
                  <div className="progress mb-2" style={{ height: '8px' }}>
                    <div className="progress-bar" style={{ width: `${pct}%` }} />
                  </div>
                  <Link to={`/events/${e.id}`} className="btn btn-primary w-100 btn-sm">
                    Ver detalles
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
        {events.length === 0 && <p className="text-muted">No hay eventos publicados.</p>}
      </div>
    </div>
  );
}
