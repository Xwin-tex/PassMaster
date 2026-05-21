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
    <div className="container mt-4">
      <h2 className="mb-4">Panel de Control</h2>
      <p className="text-muted">Bienvenido, <strong>{user?.name}</strong></p>

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card text-white bg-primary">
            <div className="card-body">
              <h5 className="card-title">Eventos</h5>
              <p className="display-6">{published.length}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-success">
            <div className="card-body">
              <h5 className="card-title">Boletos Vendidos</h5>
              <p className="display-6">{totalSold}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-warning">
            <div className="card-body">
              <h5 className="card-title">Capacidad Total</h5>
              <p className="display-6">{totalCapacity}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-info">
            <div className="card-body">
              <h5 className="card-title">Ocupación</h5>
              <p className="display-6">
                {totalCapacity > 0 ? Math.round((totalSold / totalCapacity) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <h4>Eventos Recientes</h4>
      <div className="list-group">
        {events.slice(0, 5).map((e) => (
          <Link key={e.id} to={`/events/${e.id}`} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
            <div>
              <strong>{e.name}</strong><br />
              <small className="text-muted">{new Date(e.date).toLocaleDateString()} – {e.location}</small>
            </div>
            <span className={`badge bg-${e.status === 'published' ? 'success' : e.status === 'draft' ? 'secondary' : 'danger'} rounded-pill`}>
              {e.status}
            </span>
          </Link>
        ))}
        {events.length === 0 && <p className="text-muted">No hay eventos aún.</p>}
      </div>
    </div>
  );
}
