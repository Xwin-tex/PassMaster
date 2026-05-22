import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => localStorage.getItem('pm-theme') === 'dark');
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('pm-theme', dark ? 'dark' : 'light');
  }, [dark]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark px-3 px-md-4">
      <Link className="navbar-brand d-flex align-items-center" to="/" onClick={() => setCollapsed(true)}>
        <span className="navbar-brand-icon">P</span>
        PassMaster
      </Link>
      <div className="d-flex align-items-center gap-1 d-lg-none">
        <button className="btn btn-sm btn-outline-light" onClick={() => setDark(!dark)} title="Modo oscuro">
          {dark ? '☀️' : '🌙'}
        </button>
        {user && (
          <Link className="nav-link text-white-50 small py-0 px-1" to="/profile" onClick={() => setCollapsed(true)}>
            {user.name?.charAt(0).toUpperCase()}
          </Link>
        )}
        <button className="navbar-toggler border-0" onClick={() => setCollapsed(!collapsed)} aria-label="Menú">
          <span className="navbar-toggler-icon"></span>
        </button>
      </div>
      <div className={`${collapsed ? 'collapse' : ''} navbar-collapse`}>
        <ul className="navbar-nav me-auto mt-2 mt-lg-0">
          {user && (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/events" onClick={() => setCollapsed(true)}>Eventos</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/my-tickets" onClick={() => setCollapsed(true)}>Mis Tickets</Link>
              </li>
              {(user.role === 'admin' || user.role === 'staff' || user.role === 'organizer') && (
                <li className="nav-item">
                  <Link className="nav-link" to="/checkin" onClick={() => setCollapsed(true)}>Check-in</Link>
                </li>
              )}
              {user.role === 'organizer' && (
                <li className="nav-item">
                  <Link className="nav-link" to="/events/new" onClick={() => setCollapsed(true)}>Crear Evento</Link>
                </li>
              )}
              {user.role === 'admin' && (
                <li className="nav-item">
                  <Link className="nav-link" to="/admin" onClick={() => setCollapsed(true)}>Admin</Link>
                </li>
              )}
              <li className="nav-item d-lg-none">
                <Link className="nav-link" to="/profile" onClick={() => setCollapsed(true)}>Mi Perfil</Link>
              </li>
              <li className="nav-item d-lg-none">
                <span className="nav-link text-white-50 small">{user.name}</span>
              </li>
              <li className="nav-item d-lg-none">
                <button className="btn btn-outline-light btn-sm w-100 mt-1" onClick={handleLogout}>Cerrar sesión</button>
              </li>
            </>
          )}
          {!user && (
            <li className="nav-item">
              <Link className="nav-link" to="/login" onClick={() => setCollapsed(true)}>Ingresar</Link>
            </li>
          )}
        </ul>
        <div className="d-none d-lg-flex align-items-center gap-2">
          <button className="btn btn-sm btn-outline-light" onClick={() => setDark(!dark)} title="Modo oscuro">
            {dark ? '☀️' : '🌙'}
          </button>
          {user && (
            <>
              <Link className="nav-link text-white-50 small py-0" to="/profile">Mi Perfil</Link>
              <span className="text-white-50 small d-none d-xl-inline">{user.name}</span>
            </>
          )}
          {user ? (
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Cerrar sesión</button>
          ) : (
            <Link className="btn btn-outline-light btn-sm" to="/login">Ingresar</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
