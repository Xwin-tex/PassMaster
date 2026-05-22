import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => localStorage.getItem('pm-theme') === 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('pm-theme', dark ? 'dark' : 'light');
  }, [dark]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark px-4">
      <Link className="navbar-brand d-flex align-items-center" to="/">
        <span className="navbar-brand-icon">P</span>
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
              {user.role === 'admin' && (
                <li className="nav-item">
                  <Link className="nav-link" to="/admin">Admin</Link>
                </li>
              )}
            </>
          )}
        </ul>
        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-sm btn-outline-light" onClick={() => setDark(!dark)} title="Modo oscuro">
            {dark ? '☀️' : '🌙'}
          </button>
          {user && (
            <>
              <Link className="nav-link text-white-50 small py-0" to="/profile">Mi Perfil</Link>
              <span className="text-white-50 small">{user.name}</span>
            </>
          )}
          {user ? (
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
              Cerrar sesión
            </button>
          ) : (
            <Link className="btn btn-outline-light btn-sm" to="/login">Ingresar</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
