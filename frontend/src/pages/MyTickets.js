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
    <div className="container mt-4">
      <h2 className="mb-4">Mis Tickets</h2>
      {tickets.length === 0 ? (
        <p className="text-muted">No has comprado boletos aún.</p>
      ) : (
        <div className="row g-3">
          {tickets.map((t) => (
            <div key={t.id} className="col-md-6">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h5 className="card-title mb-1">{t.event_name}</h5>
                      <p className="text-muted small mb-2">
                        {new Date(t.event_date).toLocaleDateString()} – {t.event_location}
                      </p>
                    </div>
                    <span className={`badge bg-${t.status === 'active' ? 'success' : t.status === 'used' ? 'secondary' : 'danger'} fs-6`}>
                      {t.status}
                    </span>
                  </div>
                  <hr />
                  <div className="text-center">
                    <p className="fw-bold mb-1 font-monospace user-select-all" style={{ fontSize: '1.1rem', letterSpacing: '2px' }}>
                      {t.unique_code}
                    </p>
                    <p className="text-muted small">Código único de ingreso</p>
                    <small className="text-muted">
                      Comprado el {new Date(t.purchase_date).toLocaleDateString()}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
