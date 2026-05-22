import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    api.get('/tickets/mine')
      .then((res) => setTickets(res.data.tickets))
      .catch(() => {});
  }, []);

  return (
    <div className="fade-in">
      <div className="hero-section mb-4">
        <div className="container">
          <h1 className="display-5 fw-bold mb-2">Mis Tickets</h1>
          <p className="text-white-50 mb-0">Todos tus boletos digitales en un solo lugar</p>
        </div>
      </div>

      <div className="container">
        {tickets.length === 0 ? (
          <div className="card p-5 text-center fade-in-up">
            <span style={{ fontSize: '3rem' }}>🎫</span>
            <h4 className="mt-3">No tienes tickets</h4>
            <p className="text-muted">Compra boletos para tus eventos favoritos.</p>
            <a href="/events" className="btn btn-primary">Ver eventos</a>
          </div>
        ) : (
          <div className="row g-4">
            {tickets.map((t, i) => (
              <div key={t.id} className="col-md-6 fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="card ticket-card p-0 overflow-hidden">
                  <div className="p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <p className="small text-purple-300 mb-0 opacity-75">🎟️ ENTRADA DIGITAL</p>
                        <h5 className="card-title text-white mb-1 mt-1">{t.event_name}</h5>
                      </div>
                      <span className={`badge bg-${t.status === 'active' ? 'success' : t.status === 'used' ? 'secondary' : 'danger'} fs-6`}>
                        {t.status === 'active' ? 'Válido' : t.status === 'used' ? 'Usado' : t.status}
                      </span>
                    </div>
                    <p className="text-white-50 small mb-3">
                      📅 {new Date(t.event_date).toLocaleDateString()} &nbsp;📍 {t.event_location}
                    </p>
                    <div className="ticket-code text-center mb-3">
                      {t.unique_code}
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-white-50">
                        🕐 {new Date(t.purchase_date).toLocaleDateString()}
                      </small>
                      <small className="text-white-50 opacity-75">PassMaster</small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
