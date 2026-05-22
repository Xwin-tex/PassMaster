import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');

  const fetchEvents = (q = '') => {
    const params = new URLSearchParams({ status: 'published' });
    if (q) params.set('search', q);
    api.get(`/events?${params}`)
      .then((res) => setEvents(res.data.events))
      .catch(() => {});
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEvents(search);
  };

  return (
    <div className="fade-in">
      <div className="hero-section mb-4">
        <div className="container">
          <h1 className="display-5 fw-bold mb-2">Eventos Disponibles</h1>
          <p className="text-white-50 mb-0">Encuentra tu próximo evento y asegura tu boleto</p>
        </div>
      </div>

      <div className="container">
        <form onSubmit={handleSearch} className="mb-4 fade-in-up">
          <div className="input-group">
            <input
              className="form-control"
              placeholder="🔍 Buscar por nombre, ubicación..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-primary" type="submit">Buscar</button>
            {search && (
              <button className="btn btn-outline-secondary" type="button" onClick={() => { setSearch(''); fetchEvents(''); }}>
                Limpiar
              </button>
            )}
          </div>
        </form>

        {events.length === 0 ? (
          <div className="card p-5 text-center fade-in-up">
            <span style={{ fontSize: '3rem' }}>🎭</span>
            <h4 className="mt-3">{search ? 'Sin resultados' : 'No hay eventos publicados'}</h4>
            <p className="text-muted">{search ? 'Prueba con otro término de búsqueda.' : 'Vuelve pronto para ver los próximos eventos.'}</p>
          </div>
        ) : (
          <div className="row g-4">
            {events.map((e, i) => {
              const sold = e.sold || 0;
              const pct = e.capacity > 0 ? Math.round((sold / e.capacity) * 100) : 0;
              const available = e.capacity - sold;

              return (
                <div key={e.id} className="col-md-4 fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="card h-100 border-0 overflow-hidden">
                    <div className={`event-card-img img-gradient-${(i % 4) + 1}`}>
                      🎟️
                    </div>
                    <div className="card-body d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title mb-0">{e.name}</h5>
                        <span className={`badge bg-${available > 0 ? 'success' : 'danger'}`}>
                          {available > 0 ? 'Disponible' : 'Agotado'}
                        </span>
                      </div>
                      <p className="text-muted small mb-2">
                        📅 {new Date(e.date).toLocaleDateString()} &nbsp;📍 {e.location}
                      </p>
                      {e.description && (
                        <p className="text-muted small flex-grow-1">{e.description.substring(0, 120)}</p>
                      )}
                      <div className="progress mb-2" style={{ height: '6px' }}>
                        <div className="progress-bar" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="d-flex justify-content-between align-items-center mt-auto">
                        <span className="fw-bold fs-5" style={{ color: 'var(--pm-primary)' }}>
                          ${parseFloat(e.ticket_price).toFixed(2)}
                        </span>
                        <span className="text-muted small">{available} lugares</span>
                      </div>
                      <Link to={`/events/${e.id}`} className="btn btn-primary w-100 mt-3 btn-sm">
                        Ver detalles
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
