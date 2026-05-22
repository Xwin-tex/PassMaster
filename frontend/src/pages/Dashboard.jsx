import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api.get('/events').then((res) => setEvents(res.data.events)).catch(() => {});
  }, []);

  const published = events.filter((e) => e.status === 'published');
  const totalSold = published.reduce((sum, e) => sum + (e.sold || 0), 0);
  const totalCapacity = published.reduce((sum, e) => sum + e.capacity, 0);

  return (
    <div className="fade-in">
      <div className="hero-section mb-4">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-8">
              <p className="text-purple-300 small fw-semibold mb-1 slide-down">
                {user?.role === 'organizer' ? 'Panel del organizador' : user?.role === 'staff' ? 'Panel de control' : 'Panel del cliente'}
              </p>
              <h1 className="display-5 fw-bold mb-2 slide-down" style={{ animationDelay: '0.1s' }}>
                Bienvenido, {user?.name?.split(' ')[0]}
              </h1>
              <p className="text-white-50 mb-0 slide-down" style={{ animationDelay: '0.2s' }}>
                Gestiona tus eventos y boletos desde aquí
              </p>
            </div>
            <div className="col-md-4 text-end d-none d-md-block">
              <span style={{ fontSize: '4rem', opacity: 0.3 }}>🎫</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="row g-3 mb-4 fade-in-up">
          <div className="col-md-3">
            <div className="card dashboard-card text-white p-3" style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}>
              <div className="card-body">
                <p className="card-text small opacity-75 mb-1">Eventos</p>
                <p className="display-6 mb-0">{published.length}</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card dashboard-card text-white p-3" style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
              <div className="card-body">
                <p className="card-text small opacity-75 mb-1">Boletos Vendidos</p>
                <p className="display-6 mb-0">{totalSold}</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card dashboard-card text-white p-3" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
              <div className="card-body">
                <p className="card-text small opacity-75 mb-1">Capacidad Total</p>
                <p className="display-6 mb-0">{totalCapacity}</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card dashboard-card text-white p-3" style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)' }}>
              <div className="card-body">
                <p className="card-text small opacity-75 mb-1">Ocupación</p>
                <p className="display-6 mb-0">
                  {totalCapacity > 0 ? Math.round((totalSold / totalCapacity) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-3 mb-3">
          <div className="section-divider"></div>
          <h4 className="mb-0">Eventos Recientes</h4>
        </div>

        <div className="row g-3">
          {events.slice(0, 6).map((e, i) => {
            const sold = e.sold || 0;
            const pct = e.capacity > 0 ? Math.round((sold / e.capacity) * 100) : 0;
            return (
              <div key={e.id} className="col-md-4 fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <Link to={`/events/${e.id}`} className="text-decoration-none">
                  <div className="card h-100">
                    <div className={`event-card-img img-gradient-${(i % 4) + 1}`}>
                      🎫
                    </div>
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="card-title mb-0 text-dark">{e.name}</h6>
                        <span className={`badge bg-${e.status === 'published' ? 'success' : 'secondary'}`}>
                          {e.status}
                        </span>
                      </div>
                      <p className="text-muted small mb-2">
                        {new Date(e.date).toLocaleDateString()} – {e.location}
                      </p>
                      <div className="progress mb-2" style={{ height: '6px' }}>
                        <div className="progress-bar" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="d-flex justify-content-between small">
                        <span className="text-muted">{sold}/{e.capacity} vendidos</span>
                        <span className="fw-bold text-primary">${parseFloat(e.ticket_price).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
          {events.length === 0 && (
            <div className="col-12">
              <div className="card p-5 text-center">
                <p className="text-muted mb-0">No hay eventos aún.</p>
                {user?.role === 'organizer' && (
                  <Link to="/events/new" className="btn btn-primary mt-3">Crear primer evento</Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
