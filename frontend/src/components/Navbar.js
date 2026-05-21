import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <Link className="navbar-brand fw-bold" to="/">
        PassMaster
      </Link>
      <div className="collapse navbar-collapse">
        <ul className="navbar-nav me-auto">
          {user && (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/events">Eventos</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/my-tickets">Mis Tickets</Link>
              </li>
              {(user.role === 'admin' || user.role === 'staff' || user.role === 'organizer') && (
                <li className="nav-item">
                  <Link className="nav-link" to="/checkin">Check-in</Link>
                </li>
              )}
              {user.role === 'organizer' && (
                <li className="nav-item">
                  <Link className="nav-link" to="/events/new">Crear Evento</Link>
                </li>
              )}
            </>
          )}
        </ul>
        <span className="navbar-text me-3">{user?.name}</span>
        {user ? (
          <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
            Cerrar sesión
          </button>
        ) : (
          <Link className="btn btn-outline-light btn-sm" to="/login">Ingresar</Link>
        )}
      </div>
    </nav>
  );
}
